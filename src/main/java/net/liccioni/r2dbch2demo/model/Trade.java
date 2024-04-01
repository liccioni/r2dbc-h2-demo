package net.liccioni.r2dbch2demo.model;

import org.springframework.data.annotation.Id;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trade
{
    @Id
    @Getter
    private long id;
    private String product;
    private String portfolio;
    private String book;
    private Long tradeId;
    private Long submitterId;
    private Long submitterDealId;
    private String dealType;
    private String bidType;
    private Double currentValue;
    private Double previousValue;
    private Long pl1;
    private Long pl2;
    private Long gainDx;
    private Long sxPx;
    private Long x99Out;
    private Long batch;
}
