package com.gympro.desktop.model;

public class Member {
    public int id_miembro;
    public String nombre;
    public String apellido;
    public String telefono;
    public String email;
    public Subscription suscripcion;
    public boolean activo = true;

    public Member() {}

    public String nombreCompleto() {
        return (nombre == null ? "" : nombre) + " " + (apellido == null ? "" : apellido);
    }
}
