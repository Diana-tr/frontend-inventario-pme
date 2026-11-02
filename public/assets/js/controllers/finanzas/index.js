import FinanzasService from "../../services/finanzas_service.js";
import NotificationService from "../../core/notification.js";
import SecurityManager from "../../core/security.js";


const FinanceController = (() => {
    let chartInstance = null;

    function formatCurrency(amount) {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 2,
        }).format(parseFloat(amount) || 0);
    }

    async function cargarDatosFinancieros() {
        $("#finance_loader").show();
        $("#finance_content").hide();

        try{
            const response = await FinanzasService.obtenerResumenFinanciero();

            if (response && response.success && response.data) {
                renderKPIs(response.data);
                renderTablaSesiones(response.data.active_sessions);
                renderGrafico(response.data.today);

                $("#finance_loader").hide();
                $("#finance_content").fadeIn();
            } else {
                NotificationService.toastError("No se pudieron cargar los datos financieros.");
                $("#finance_loader").hide();
            }
        } catch (error) {
            console.error("[FINANZAS] Error:", error);
            NotificationService.toastError("Error de conexion al cargar finanzas");
            $("#finance_loader").hide();
        }
    }

    function renderKPIs(data) {
        $("#kpi_drawers").text(formatCurrency(data.total_cash_in_drawers));

        const today = data.today;
        $("#kpi_sales_cash").text(formatCurrency(today.cash_in));
        $("#kpi_cash_out").text(formatCurrency(today.cash_out));
        $("#kpi_sales_elec").text(formatCurrency(today.electronic_in));
    }

    function renderTablaSesiones(sessions) {
        const tbody = $("#tbody_open_sessions");
        tbody.empty();
        $("#badge_open_count").text(sessions.length);

        if (sessions.length === 0) {
            tbody.html('<tr><td colspan="3" class="text-center text-muted py-3">No hay cajas abiertas</td></tr>');
            return;
        }

        sessions.forEach(s => {
            tbody.append(`
                <tr>
                    <td class="font-weight-bold">${s.register_name}</td>
                    <td>${s.user_name}</td>
                    <td class="text-right text-success font-weight-bold">${formatCurrency(s.expected_balance)}</td>
                </tr>
            `);
        });
    }

    function renderGrafico(todayData) {
        const canvas = document.getElementById("chart_cash_flow");
        if (!canvas || typeof Chart === "undefined") return;

        if (chartInstance){
            chartInstance.destroy();
        }

        chartInstance = new Chart(canvas.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Ingresos Efectivos", "Ingresos Electronicos", "Egresos Efectivos"],
                datasets: [{
                    label: "Monto (COP)",
                    data: [
                        parseFloat(todayData.cash_in || 0),
                        parseFloat(todayData.electronic_in || 0),
                        parseFloat(todayData.cash_out || 0)
                    ],
                    backgroundColor: ["#10B981", "#3B82F6", "#EF4444"],
                    borderRadius: 6,
                    barThickness: 50,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { callback: (val) => "$" + Number(val).toLocaleString("es-CO")}
                    }
                }
            }
        });
    }

    return {
        init: () => {
            if (!SecurityManager.hasPermission("reports.view")) {
                SecurityManager.redirectIfUnauthorized("reports.view");
                return;
            }
            cargarDatosFinancieros();
        }
    };
})();

export default FinanceController;