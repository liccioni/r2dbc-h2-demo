package net.liccioni.r2dbch2demo.websocket;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.liccioni.r2dbch2demo.model.Trade;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeUIEvent
{
    private TradeUIEventType type;
    private Object payload;
}
