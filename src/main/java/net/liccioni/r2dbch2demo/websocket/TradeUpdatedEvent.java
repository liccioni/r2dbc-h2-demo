package net.liccioni.r2dbch2demo.websocket;

import org.springframework.context.ApplicationEvent;

import net.liccioni.r2dbch2demo.model.Trade;

public class TradeUpdatedEvent extends ApplicationEvent
{
    private final Trade trade;

    public TradeUpdatedEvent(final Object source, Trade trade)
    {
        super(source);
        this.trade = trade;
    }

    public Trade getTrade()
    {
        return trade;
    }
}
