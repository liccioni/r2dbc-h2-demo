package net.liccioni.r2dbch2demo.websocket;

import java.util.List;

import lombok.Data;

@Data
public class MyPage
{
    private long offset;
    private int limit;
    private List<SortModel> sortModel;
}
