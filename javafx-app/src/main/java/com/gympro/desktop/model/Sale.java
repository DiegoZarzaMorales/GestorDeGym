package com.gympro.desktop.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Sale {
    public int id_venta;
    public List<SaleItem> productos = new ArrayList<>();
    public double total;
    public LocalDateTime fecha_hora;

    public Sale() {}
}
