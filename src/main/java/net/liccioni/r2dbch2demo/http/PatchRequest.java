package net.liccioni.r2dbch2demo.http;

import lombok.Data;

@Data
public class PatchRequest
{
    private Double currentValue;
    private Double previousValue;
}
