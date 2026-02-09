package com.gympro.desktop.ui;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import com.gympro.desktop.data.GymStore;
import com.gympro.desktop.model.AccessRecord;
import com.gympro.desktop.model.Member;

import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;

public class AccessTerminalView extends BorderPane {

    private final GymStore store;

    private final TextField phoneField = new TextField();
    private final Label statusTitle = new Label("Listo");
    private final Label statusDetail = new Label("Escribe el teléfono y presiona Enter");

    private final TableView<AccessRecord> table = new TableView<>();

    public AccessTerminalView(GymStore store) {
        this.store = store;
        getStyleClass().add("gp-terminal");
        setPadding(new Insets(18));

        setTop(buildHeader());
        setCenter(buildCenter());
        setBottom(buildBottom());

        refreshTable();
    }

    private Pane buildHeader() {
        VBox card = new VBox(10);
        card.getStyleClass().add("gp-card");

        Label title = new Label("Terminal de Acceso");
        title.getStyleClass().add("gp-h2");

        phoneField.setPromptText("Teléfono del miembro (simula huella)");
        phoneField.getStyleClass().add("gp-input");
        phoneField.setOnAction(e -> lookupAndRegister());

        HBox row = new HBox(10, phoneField, makeBtn("Registrar", this::lookupAndRegister));
        HBox.setHgrow(phoneField, Priority.ALWAYS);

        card.getChildren().addAll(title, row);
        return card;
    }

    private Pane buildCenter() {
        VBox box = new VBox(14);

        VBox status = new VBox(6);
        status.getStyleClass().add("gp-card");
        statusTitle.getStyleClass().add("gp-h2");
        statusDetail.getStyleClass().add("gp-muted");
        status.getChildren().addAll(statusTitle, statusDetail);

        VBox tableCard = new VBox(10);
        tableCard.getStyleClass().add("gp-card");

        Label h = new Label("Registros (últimos)");
        h.getStyleClass().add("gp-h2");

        table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);
        TableColumn<AccessRecord, String> cFecha = new TableColumn<>("Fecha/Hora");
        cFecha.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(
                d.getValue().fecha_hora.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        ));
        TableColumn<AccessRecord, Number> cMiembro = new TableColumn<>("ID Miembro");
        cMiembro.setCellValueFactory(d -> new javafx.beans.property.SimpleIntegerProperty(d.getValue().id_miembro));
        TableColumn<AccessRecord, String> cTipo = new TableColumn<>("Tipo");
        cTipo.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().tipo));
        table.getColumns().setAll(cFecha, cMiembro, cTipo);

        tableCard.getChildren().addAll(h, table);

        box.getChildren().addAll(status, tableCard);
        return box;
    }

    private Pane buildBottom() {
        HBox row = new HBox(10);
        row.setPadding(new Insets(10, 0, 0, 0));
        Button clear = new Button("Limpiar");
        clear.getStyleClass().add("gp-btn");
        clear.setOnAction(e -> {
            phoneField.clear();
            statusTitle.setText("Listo");
            statusDetail.setText("Escribe el teléfono y presiona Enter");
            phoneField.requestFocus();
        });
        row.getChildren().add(clear);
        return row;
    }

    private Button makeBtn(String text, Runnable action) {
        Button b = new Button(text);
        b.getStyleClass().add("gp-btn-primary");
        b.setOnAction(e -> action.run());
        return b;
    }

    private void lookupAndRegister() {
        String phone = phoneField.getText() == null ? "" : phoneField.getText().trim();
        if (phone.isBlank()) {
            setStatusError("Teléfono vacío", "Ingresa el teléfono del miembro");
            return;
        }

        Optional<Member> optMember = store.findMemberByPhone(phone);
        if (optMember.isEmpty()) {
            setStatusError("No encontrado", "No existe un miembro con ese teléfono");
            return;
        }

        Member member = optMember.get();
        boolean active = member.suscripcion != null && member.suscripcion.estaActiva(LocalDate.now());
        if (!active) {
            setStatusError("Suscripción vencida", member.nombreCompleto());
            return;
        }

        AccessRecord rec = store.registerAccess(member, "ENTRADA");
        setStatusOk("Acceso permitido", member.nombreCompleto() + " · " + rec.tipo);
        refreshTable();
        phoneField.selectAll();
    }

    private void refreshTable() {
        // Show most recent 30
        var list = store.db().registros_acceso;
        int start = Math.max(0, list.size() - 30);
        table.setItems(FXCollections.observableArrayList(list.subList(start, list.size())));
    }

    private void setStatusOk(String title, String detail) {
        statusTitle.setText(title);
        statusTitle.setStyle("-fx-text-fill: #065F46; -fx-font-weight: 900;");
        statusDetail.setText(detail);
    }

    private void setStatusError(String title, String detail) {
        statusTitle.setText(title);
        statusTitle.setStyle("-fx-text-fill: #991B1B; -fx-font-weight: 900;");
        statusDetail.setText(detail);
    }
}
