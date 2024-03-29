package net.liccioni.r2dbch2demo.websocket;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.data.relational.core.query.Query;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;

import net.liccioni.r2dbch2demo.model.Product;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

public class ProductWebSocketHandler implements WebSocketHandler
{
    private final R2dbcEntityOperations r2dbcEntityOperations;
    private final ObjectMapper objectMapper;

    public ProductWebSocketHandler(final R2dbcEntityOperations r2dbcEntityOperations,
                                   final Flux<Product> productGenerator,
                                   final ObjectMapper objectMapper)
    {
        this.r2dbcEntityOperations = r2dbcEntityOperations;
        this.objectMapper = objectMapper;
        final var sink = Sinks.many().multicast().directBestEffort();
        productGenerator.subscribe(sink::tryEmitNext);
    }

    @Override
    public Mono<Void> handle(WebSocketSession session)
    {
        return session.send(session.receive()
            .map(this::readPage)
            .switchMap(page ->
            {
                return r2dbcEntityOperations.select(Query.empty()
                        .offset(page.getOffset())
                        .limit(page.getLimit()), Product.class)
                    .map(p -> session.binaryMessage(dataBufferFactory -> dataBufferFactory.wrap(getProductBytes(p))));
//                    .concatWith(sub.map(p -> session.textMessage(p.toString())));
            }));
    }

    private MyPage readPage(final WebSocketMessage page)
    {
        try
        {
            return objectMapper.readValue(page.getPayload().asInputStream(), MyPage.class);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    private byte[] getProductBytes(final Product p)
    {
        try
        {
            return objectMapper.writeValueAsBytes(p);
        }
        catch (JsonProcessingException e)
        {
            throw new RuntimeException(e);
        }
    }
}