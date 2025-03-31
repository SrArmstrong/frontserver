import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function Graficas() {
    const [message, setMessage] = useState("Verificando sesión...");
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
    
        if (!token) {
            setMessage("No autorizado. Redirigiendo...");
            setTimeout(() => navigate("/"), 2000);
            return;
        }
    
        fetch("https://server2-p77b.onrender.com/api/verify-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.valid) {
                setMessage("Cargando gráficas...");
                loadStats(token);
            } else {
                logout();
            }
        })
        .catch(() => logout());
    }, [navigate]);

    const loadStats = (token) => {
        fetch("https://server2-p77b.onrender.com/api/server-stats", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setStats(data.data);
                setTimeout(() => renderCharts(data.data), 100);
            } else {
                setMessage("Error al cargar estadísticas");
            }
        })
        .catch(() => setMessage("Error al conectar con el servidor"));
    };

    const renderCharts = (serverData) => {
        // Limpiar gráficas anteriores si existen
        Chart.getChart("totalRequestsChart")?.destroy();
        Chart.getChart("methodsChart")?.destroy();
        Chart.getChart("statusChart")?.destroy();
        Chart.getChart("responseTimeChart")?.destroy();
        Chart.getChart("logLevelsChart")?.destroy();
        Chart.getChart("userAgentsChart")?.destroy();
        Chart.getChart("endpointResponseTimeChart")?.destroy();

        renderTotalRequestsChart(serverData);
        renderMethodsChart(serverData);
        renderStatusCodesChart(serverData);
        renderResponseTimeChart(serverData);
        renderLogLevelsChart(serverData);
        renderUserAgentsChart(serverData);
        renderEndpointResponseTimeChart(serverData);
    };

    const chartContainerStyle = {
        height: '400px',
        position: 'relative',
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)'
        }
    };
    
    const chartTitleStyle = {
        marginTop: '0',
        marginBottom: '15px',
        color: '#2d3748',
        fontSize: '16px',
        fontWeight: '600',
        textAlign: 'center'
    };

    const renderTotalRequestsChart = (data) => {
        const ctx = document.getElementById('totalRequestsChart');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Server1', 'Server2'],
                datasets: [{
                    label: 'Total de peticiones',
                    data: [data.Server1.totalRequests, data.Server2.totalRequests],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(241, 60, 60, 0.7)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(241, 60, 60, 0.7)'
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Peticiones Totales por Servidor',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.y} peticiones`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 10
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    };

    const renderMethodsChart = (data) => {
        const ctx = document.getElementById('methodsChart');
        const methods = ['GET', 'POST', 'PUT', 'DELETE'];
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: methods,
                datasets: [
                    {
                        label: 'Server1',
                        data: methods.map(m => data.Server1.methods[m] || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2',
                        data: methods.map(m => data.Server2.methods[m] || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Métodos HTTP',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    };

    const renderStatusCodesChart = (data) => {
        const ctx = document.getElementById('statusChart');
        const statusCodes = Object.keys({
            ...data.Server1.statusCodes,
            ...data.Server2.statusCodes
        }).sort();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statusCodes,
                datasets: [
                    {
                        label: 'Server1',
                        data: statusCodes.map(s => data.Server1.statusCodes[s] || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2',
                        data: statusCodes.map(s => data.Server2.statusCodes[s] || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Códigos de Estado HTTP',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.parsed.y} peticiones`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    };

    const renderResponseTimeChart = (data) => {
        const ctx = document.getElementById('responseTimeChart');
        const endpoints = Object.keys({
            ...data.Server1.endpoints,
            ...data.Server2.endpoints
        }).slice(0, 5); // Mostrar solo los 5 endpoints principales
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: endpoints,
                datasets: [
                    {
                        label: 'Server1 (ms)',
                        data: endpoints.map(e => data.Server1.endpoints[e]?.avgTime || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2 (ms)',
                        data: endpoints.map(e => data.Server2.endpoints[e]?.avgTime || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tiempo de Respuesta Promedio (Top 5 Endpoints)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        title: {
                            display: true,
                            text: 'Milisegundos'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    };

    // Nueva gráfica: Niveles de Log
    const renderLogLevelsChart = (data) => {
        const ctx = document.getElementById('logLevelsChart');
        const levels = ['info', 'warning', 'error', 'debug'];
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: levels,
                datasets: [
                    {
                        label: 'Server1',
                        data: levels.map(l => data.Server1.logLevels[l] || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2',
                        data: levels.map(l => data.Server2.logLevels[l] || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cantidad de logs'
                        }
                    }
                }
            }
        });
    };

    // Nueva gráfica: User Agents
    const renderUserAgentsChart = (data) => {
        const ctx = document.getElementById('userAgentsChart');
        
        // Obtener los 5 user agents más comunes de ambos servidores
        const topAgents = [...new Set([
            ...Object.keys(data.Server1.userAgents || {}),
            ...Object.keys(data.Server2.userAgents || {})
        ])].sort((a, b) => {
            const totalA = (data.Server1.userAgents[a] || 0) + (data.Server2.userAgents[a] || 0);
            const totalB = (data.Server1.userAgents[b] || 0) + (data.Server2.userAgents[b] || 0);
            return totalB - totalA;
        }).slice(0, 5);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topAgents,
                datasets: [
                    {
                        label: 'Server1',
                        data: topAgents.map(agent => data.Server1.userAgents[agent] || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2',
                        data: topAgents.map(agent => data.Server2.userAgents[agent] || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de peticiones'
                        }
                    }
                }
            }
        });
    };

    // Nueva gráfica: Tiempos de respuesta por endpoint
    const renderEndpointResponseTimeChart = (data) => {
        const ctx = document.getElementById('endpointResponseTimeChart');
        
        // Obtener los 5 endpoints más utilizados entre ambos servidores
        const topEndpoints = [...new Set([
            ...Object.keys(data.Server1.endpoints || {}),
            ...Object.keys(data.Server2.endpoints || {})
        ])].sort((a, b) => {
            const totalA = ((data.Server1.endpoints[a]?.count || 0) + (data.Server2.endpoints[a]?.count || 0));
            const totalB = ((data.Server1.endpoints[b]?.count || 0) + (data.Server2.endpoints[b]?.count || 0));
            return totalB - totalA;
        }).slice(0, 5);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topEndpoints,
                datasets: [
                    {
                        label: 'Server1 - Tiempo (ms)',
                        data: topEndpoints.map(endpoint => data.Server1.endpoints[endpoint]?.avgTime || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server2 - Tiempo (ms)',
                        data: topEndpoints.map(endpoint => data.Server2.endpoints[endpoint]?.avgTime || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 99, 0.7)',
                        borderWidth: 1
                    },
                    {
                        label: 'Server1 - Peticiones',
                        data: topEndpoints.map(endpoint => data.Server1.endpoints[endpoint]?.count || 0),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 0.8)',
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Server2 - Peticiones',
                        data: topEndpoints.map(endpoint => data.Server2.endpoints[endpoint]?.count || 0),
                        backgroundColor: 'rgba(241, 60, 60, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 0.8)',
                        borderWidth: 1,
                        type: 'line',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label.includes('Tiempo')) {
                                    return `${label}: ${context.parsed.y.toFixed(2)} ms`;
                                } else {
                                    return `${label}: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Tiempo (ms)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Número de peticiones'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setMessage("Sesión expirada. Redirigiendo...");
        setTimeout(() => navigate("/"), 2000);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Estadísticas de Servidores</h2>
            <p style={{ textAlign: 'center' }}>{message}</p>
            
            {stats && (
                <div style={{ marginTop: '30px' }}>
                    {/* Primera fila - Gráficas principales */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                        gap: '25px',
                        marginBottom: '30px'
                    }}>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Peticiones Totales</h3>
                            <canvas id="totalRequestsChart"></canvas>
                        </div>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Métodos HTTP</h3>
                            <canvas id="methodsChart"></canvas>
                        </div>
                    </div>

                    {/* Segunda fila - Gráficas secundarias */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                        gap: '25px',
                        marginBottom: '30px'
                    }}>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Códigos de Estado</h3>
                            <canvas id="statusChart"></canvas>
                        </div>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Tiempo Respuesta Promedio</h3>
                            <canvas id="responseTimeChart"></canvas>
                        </div>
                    </div>

                    {/* Tercera fila - Gráficas adicionales */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                        gap: '25px',
                        marginBottom: '30px'
                    }}>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Distribución de Niveles de Log</h3>
                            <canvas id="logLevelsChart"></canvas>
                        </div>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>User Agents (Navegadores)</h3>
                            <canvas id="userAgentsChart"></canvas>
                        </div>
                    </div>

                    {/* Cuarta fila - Gráfica de rendimiento */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '25px'
                    }}>
                        <div style={chartContainerStyle}>
                            <h3 style={chartTitleStyle}>Comparativa de Tiempos por Endpoint</h3>
                            <canvas id="endpointResponseTimeChart"></canvas>
                        </div>
                    </div>
                </div>
            )}
            
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: '15px',
                    marginTop: '30px'
                }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        ':hover': {
                            backgroundColor: '#bb2d3b'
                        }
                    }}
                >
                    Cerrar sesión
                </button>
                <button 
                    onClick={() => navigate("/home")}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                    }}
                >
                    Volver al Home
                </button>
            </div>
        </div>
    );
}

export default Graficas;