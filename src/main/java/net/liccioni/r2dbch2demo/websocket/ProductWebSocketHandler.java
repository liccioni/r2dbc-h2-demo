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
import net.liccioni.r2dbch2demo.model.Trade;
import net.liccioni.r2dbch2demo.model.TradeDataLoader;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class ProductWebSocketHandler implements WebSocketHandler
{
    private final R2dbcEntityOperations r2dbcEntityOperations;
    private final ObjectMapper objectMapper;
//    private final Sinks.Many<Product> sink;

    public ProductWebSocketHandler(final R2dbcEntityOperations r2dbcEntityOperations,
                                   final Flux<Product> productGenerator,
                                   final ObjectMapper objectMapper)
    {
        this.r2dbcEntityOperations = r2dbcEntityOperations;
        this.objectMapper = objectMapper;
//        this.sink = Sinks.many().multicast().directBestEffort();
//        productGenerator.log().subscribe(this.sink::tryEmitNext);
        new TradeDataLoader(r2dbcEntityOperations).loadTradeData();
    }

    @Override
    public Mono<Void> handle(WebSocketSession session)
    {
        return session.send(session.receive()
            .map(this::readPage)
                .log()
            .flatMapSequential(page ->
            {
                return r2dbcEntityOperations.select(Query.empty()
                        .offset(page.getOffset())
                        .limit(page.getLimit()), Trade.class)
                    .log()
                    .map(p -> session.binaryMessage(dataBufferFactory -> dataBufferFactory.wrap(getBytes(p))));
//                    .concatWith(sink.asFlux()
//                        .map(p -> session.binaryMessage(dataBufferFactory -> dataBufferFactory.wrap(getProductBytes(p)))));
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

    private byte[] getBytes(final Object p)
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