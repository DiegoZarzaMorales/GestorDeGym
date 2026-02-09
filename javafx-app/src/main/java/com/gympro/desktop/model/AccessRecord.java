package com.gympro.desktop.model;

import java.time.LocalDateTime;

public class AccessRecord {
    public int id_registro;
    public int id_miembro;
    public String tipo; // ENTRADA | SALIDA
    public LocalDateTime fecha_hora;

    public AccessRecord() {}
}
