package net.liccioni.r2dbch2demo.websocket;

import static net.liccioni.r2dbch2demo.websocket.TradeUIEventType.UPDATE;

import java.io.IOException;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
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
import reactor.core.publisher.Sinks;

public class QueryTradeWebSocketHandler implements WebSocketHandler
{
    private final R2dbcEntityOperations r2dbcEntityOperations;
    private final ObjectMapper objectMapper;
    private final Sinks.Many<Trade> sink;

    public QueryTradeWebSocketHandler(final R2dbcEntityOperations r2dbcEntityOperations,
                                      final Flux<Product> productGenerator,
                                      final ObjectMapper objectMapper)
    {
        this.r2dbcEntityOperations = r2dbcEntityOperations;
        this.objectMapper = objectMapper;
        this.sink = Sinks.many().multicast().directBestEffort();
//        productGenerator.log().subscribe(this.sink::tryEmitNext);
        new TradeDataLoader(r2dbcEntityOperations).loadTradeData();
    }

    @Override
    public Mono<Void> handle(WebSocketSession session)
    {
        return session.send(session.receive()
            .map(this::readPage)
            .log()
            .switchMap(page ->
            {
                var query = Query.empty();
                List<Sort.Order> orders = page.getSortModel().stream().map(QueryTradeWebSocketHandler::getOrder).toList();
                if (!orders.isEmpty())
                {
                    query = query.sort(Sort.by(orders));
                }
                return r2dbcEntityOperations.select(query
                        .offset(page.getOffset())
                        .limit(page.getLimit()), Trade.class)
                    .collectList()
                    .map(trades -> new TradeUIEvent(TradeUIEventType.PAGE, trades))
                    .log()
                    .map(p -> session.binaryMessage(dataBufferFactory -> dataBufferFactory.wrap(getBytes(p))))
                    .concatWith(sink.asFlux()
                        .map(trade -> new TradeUIEvent(UPDATE, trade))
                        .map(p -> session.binaryMessage(dataBufferFactory -> dataBufferFactory.wrap(getBytes(p))))
                        .log())
                    ;
            })
        );
    }

    @EventListener
    public void handleTradeUpdatedEvent(TradeUpdatedEvent event)
    {
        this.sink.tryEmitNext(event.getTrade());
    }

    private static Sort.Order getOrder(final SortModel sortModel)
    {
        switch (sortModel.getSort())
        {
            case asc ->
            {
                return Sort.Order.asc(sortModel.getColId());
            }
            case desc ->
            {
                return Sort.Order.desc(sortModel.getColId());
            }
            default -> throw new IllegalStateException("Unexpected value: " + sortModel.getSort());
        }
    }

    private PageRequest readPage(final WebSocketMessage page)
    {
        try
        {
            return objectMapper.readValue(page.getPayload().asInputStream(), PageRequest.class);
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