package com.gympro.desktop.data;

import com.gympro.desktop.model.AccessRecord;
import com.gympro.desktop.model.Member;
import com.gympro.desktop.model.Product;
import com.gympro.desktop.model.Sale;

import java.util.ArrayList;
import java.util.List;

public class GymDatabase {
    public List<Member> miembros = new ArrayList<>();
    public List<Product> inventario = new ArrayList<>();
    public List<AccessRecord> registros_acceso = new ArrayList<>();
    public List<Sale> ventas = new ArrayList<>();

    public GymDatabase() {}
}
