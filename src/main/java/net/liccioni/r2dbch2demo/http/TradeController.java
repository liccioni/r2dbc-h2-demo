package net.liccioni.r2dbch2demo.http;

import static org.springframework.data.relational.core.query.Criteria.from;
import static org.springframework.data.relational.core.query.Criteria.where;
import static org.springframework.data.relational.core.query.Query.query;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import net.liccioni.r2dbch2demo.model.Trade;
import net.liccioni.r2dbch2demo.websocket.TradeUpdatedEvent;
import reactor.core.publisher.Mono;

@CrossOrigin
@RestController
@RequestMapping("/trades")
public class TradeController
{
    private final ApplicationEventPublisher applicationEventPublisher;
    private final R2dbcEntityOperations r2dbcEntityOperations;

    public TradeController(ApplicationEventPublisher applicationEventPublisher, R2dbcEntityOperations r2dbcEntityOperations)
    {
        this.applicationEventPublisher = applicationEventPublisher;
        this.r2dbcEntityOperations = r2dbcEntityOperations;
    }

    @PatchMapping("/{id}")
    public Mono<ResponseEntity<Trade>> editTrade(@PathVariable final String id, @RequestBody PatchRequest patchRequest)
    {
        return r2dbcEntityOperations.selectOne(query(from(where("id").is(id))), Trade.class)
            .flatMap(trade ->
            {
                trade.setPreviousValue(patchRequest.getPreviousValue());
                trade.setCurrentValue(patchRequest.getCurrentValue());
                return r2dbcEntityOperations.update(trade);
            })
            .doOnNext(trade -> applicationEventPublisher.publishEvent(new TradeUpdatedEvent(this, trade)))
            .map(ResponseEntity::ok);
    }
}
