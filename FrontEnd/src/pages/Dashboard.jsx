import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();
    const canvasRef = useRef(null);
    const [bootPhase, setBootPhase] = useState(0);
    const [typedLines, setTypedLines] = useState([]);
    const [showMain, setShowMain] = useState(false);
    const [activeTab, setActiveTab] = useState('terminal');
    const [terminalHistory, setTerminalHistory] = useState([]);
    const [currentInput, setCurrentInput] = useState('');
    const inputRef = useRef(null);

    // Protect Route
    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    // Matrix rain effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.globalAlpha = Math.random() * 0.5 + 0.1;
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            ctx.globalAlpha = 1;
        };

        const interval = setInterval(draw, 33);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Boot sequence
    const bootLines = [
        { text: '[SYS] Initializing secure kernel...', delay: 0 },
        { text: '[SYS] Loading encryption modules... AES-256-GCM ✓', delay: 400 },
        { text: '[SYS] Establishing TOR relay... 3 nodes connected ✓', delay: 800 },
        { text: '[SYS] Mounting encrypted filesystem... /dev/sda1 ✓', delay: 1200 },
        { text: '[NET] Proxy chain: 127.0.0.1 → 185.xx.xx.xx → 91.xx.xx.xx', delay: 1600 },
        { text: '[NET] VPN tunnel active... Protocol: WireGuard ✓', delay: 2000 },
        { text: '[SEC] Firewall rules loaded... 2048 rules active ✓', delay: 2400 },
        { text: '[SEC] IDS/IPS monitoring enabled ✓', delay: 2800 },
        { text: '[SYS] Identity verified. Session token generated.', delay: 3200 },
        { text: '', delay: 3600 },
        { text: '> ACCESS GRANTED. WELCOME BACK, OPERATOR.', delay: 3800, highlight: true },
    ];

    useEffect(() => {
        bootLines.forEach(({ text, delay, highlight }) => {
            setTimeout(() => {
                setTypedLines(prev => [...prev, { text, highlight }]);
            }, delay);
        });

        setTimeout(() => {
            setShowMain(true);
        }, 5000);
    }, []);

    // Skull ASCII art
    const skull = `
    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
    ░░░░░░░▄▀░░░░░░░░░░░░░░░░▀▄░░░░░░░░░
    ░░░░░▄▀░░░░░░░░░░░░░░░░░░░░▀▄░░░░░░░
    ░░░░█░░░░░░░░░░░░░░░░░░░░░░░░█░░░░░░
    ░░░█░░░░▀▀▄░░░░░░░░░▄▀▀░░░░░░█░░░░░
    ░░█░░░░░░░░█░░░░░░░░█░░░░░░░░░░█░░░░
    ░░█░░░░░░░░█░░░░░░░░█░░░░░░░░░░█░░░░
    ░░█░░░░░░░░▀▄▄▄▄▄▄▄▀░░░░░░░░░░█░░░░
    ░░█░░░░░░░░░░░░░░░░░░░░░░░░░░░░█░░░░
    ░░░█░░░░▄░░░░░░░░░░░░░░░▄░░░░░█░░░░░
    ░░░░█░░░░▀▀▄▄▄▄▄▄▄▄▄▄▀▀░░░░░█░░░░░░
    ░░░░░▀▄░░░░░░░░░░░░░░░░░░░▄▀░░░░░░░
    ░░░░░░░▀▄▄▄░░░░░░░░░░░▄▄▄▀░░░░░░░░░
    ░░░░░░░░░░░▀▀▀▀▀▀▀▀▀▀▀░░░░░░░░░░░░░`;

    // Live data simulation
    const [networkPackets, setNetworkPackets] = useState(0);
    const [cpuLoad, setCpuLoad] = useState(0);
    const [memUsage, setMemUsage] = useState(0);
    const [connections, setConnections] = useState(0);

    useEffect(() => {
        if (!showMain) return;
        const interval = setInterval(() => {
            setNetworkPackets(prev => prev + Math.floor(Math.random() * 500));
            setCpuLoad(Math.floor(Math.random() * 30 + 10));
            setMemUsage(Math.floor(Math.random() * 20 + 40));
            setConnections(Math.floor(Math.random() * 5 + 12));
        }, 1500);
        return () => clearInterval(interval);
    }, [showMain]);

    // Terminal commands
    const handleTerminalSubmit = (e) => {
        e.preventDefault();
        if (!currentInput.trim()) return;

        const cmd = currentInput.trim().toLowerCase();
        let response = '';

        switch (cmd) {
            case 'help':
                response = 'Available: help, status, whoami, scan, clear, exit';
                break;
            case 'whoami':
                response = 'root@mainframe:~# OPERATOR [CLEARANCE: LEVEL 5]';
                break;
            case 'status':
                response = `SYSTEM: ONLINE | CPU: ${cpuLoad}% | MEM: ${memUsage}% | CONNECTIONS: ${connections}`;
                break;
            case 'scan':
                response = 'Scanning network... 3 hosts found. No vulnerabilities detected.';
                break;
            case 'clear':
                setTerminalHistory([]);
                setCurrentInput('');
                return;
            case 'exit':
                navigate('/');
                return;
            default:
                response = `Command not found: ${cmd}. Type "help" for available commands.`;
        }

        setTerminalHistory(prev => [
            ...prev,
            { type: 'input', text: `root@mainframe:~# ${currentInput}` },
            { type: 'output', text: response }
        ]);
        setCurrentInput('');
    };

    // Progress bar component
    const ProgressBar = ({ value, max, color }) => (
        <div className="progressBarTrack">
            <div
                className="progressBarFill"
                style={{
                    width: `${(value / max) * 100}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}`
                }}
            ></div>
        </div>
    );

    return (
        <div className="dashboardWrapper">
            {/* Matrix Rain Canvas */}
            <canvas ref={canvasRef} className="matrixCanvas"></canvas>

            {/* Scanline Overlay */}
            <div className="scanlineOverlay"></div>

            {/* Main Content */}
            <div className="dashboardMain">
                {/* Boot Sequence */}
                {!showMain && (
                    <div className="bootSequence">
                        <pre className="skullArt">{skull}</pre>
                        <div className="bootLines">
                            {typedLines.map((line, i) => (
                                <div key={i} className={line.highlight ? 'bootLineHighlight' : 'bootLine'}>
                                    {line.text}
                                </div>
                            ))}
                            <span className="cursor">█</span>
                        </div>
                    </div>
                )}

                {/* Dashboard Content */}
                {showMain && (
                    <div className="dashboardGrid">
                        {/* Header */}
                        <div className="dashboardHeader">
                            <div className="headerLeft">
                                <span className="headerIcon">◉</span>
                                <span className="headerTitle">MAINFRAME CONTROL PANEL</span>
                            </div>
                            <div className="headerRight">
                                <span className="headerStatus">● SECURE {user ? `[${user.username.toUpperCase()}]` : ''}</span>
                                <button onClick={() => { logout(); navigate('/'); }} className="logoutBtn">[TERMINATE]</button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="statsRow">
                            <div className="statCardLive">
                                <div className="statIcon">📡</div>
                                <div className="statInfo">
                                    <div className="statValue">{networkPackets.toLocaleString()}</div>
                                    <div className="statLabel">PACKETS_INTERCEPTED</div>
                                </div>
                            </div>
                            <div className="statCardLive">
                                <div className="statIcon">⚡</div>
                                <div className="statInfo">
                                    <div className="statValue">{cpuLoad}%</div>
                                    <div className="statLabel">CPU_LOAD</div>
                                    <ProgressBar value={cpuLoad} max={100} color="#0f0" />
                                </div>
                            </div>
                            <div className="statCardLive">
                                <div className="statIcon">🧠</div>
                                <div className="statInfo">
                                    <div className="statValue">{memUsage}%</div>
                                    <div className="statLabel">MEMORY_USAGE</div>
                                    <ProgressBar value={memUsage} max={100} color="#0ff" />
                                </div>
                            </div>
                            <div className="statCardLive">
                                <div className="statIcon">🔗</div>
                                <div className="statInfo">
                                    <div className="statValue">{connections}</div>
                                    <div className="statLabel">ACTIVE_NODES</div>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="tabNav">
                            <button
                                className={`tabBtn ${activeTab === 'terminal' ? 'tabBtnActive' : ''}`}
                                onClick={() => setActiveTab('terminal')}
                            >
                                {'>'} TERMINAL
                            </button>
                            <button
                                className={`tabBtn ${activeTab === 'network' ? 'tabBtnActive' : ''}`}
                                onClick={() => setActiveTab('network')}
                            >
                                {'>'} NETWORK_LOG
                            </button>
                        </div>

                        {/* Terminal Panel */}
                        {activeTab === 'terminal' && (
                            <div className="terminalPanel" onClick={() => inputRef.current?.focus()}>
                                <div className="terminalOutput">
                                    <div className="bootLine">Type "help" for available commands</div>
                                    {terminalHistory.map((entry, i) => (
                                        <div key={i} className={entry.type === 'input' ? 'terminalInput' : 'terminalResponse'}>
                                            {entry.text}
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleTerminalSubmit} className="terminalForm">
                                    <span className="terminalPrompt">root@mainframe:~#</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={currentInput}
                                        onChange={(e) => setCurrentInput(e.target.value)}
                                        className="terminalInputField"
                                        autoFocus
                                    />
                                </form>
                            </div>
                        )}

                        {/* Network Log Panel */}
                        {activeTab === 'network' && (
                            <div className="terminalPanel">
                                <NetworkLog />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Live network log component
const NetworkLog = () => {
    const [logs, setLogs] = useState([]);
    const ips = ['185.143.xx.xx', '91.207.xx.xx', '45.33.xx.xx', '104.16.xx.xx', '172.67.xx.xx', '198.51.xx.xx'];
    const actions = ['SYN_SCAN', 'HANDSHAKE', 'DATA_RELAY', 'PING', 'DNS_QUERY', 'TLS_INIT', 'KEEPALIVE'];
    const statuses = ['ALLOWED', 'BLOCKED', 'RELAYED', 'ENCRYPTED'];

    useEffect(() => {
        const addLog = () => {
            const ip = ips[Math.floor(Math.random() * ips.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const port = Math.floor(Math.random() * 65535);
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });

            setLogs(prev => {
                const newLogs = [...prev, { time, ip, port, action, status }];
                return newLogs.slice(-15); // Keep last 15
            });
        };

        const interval = setInterval(addLog, 800);
        addLog();
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="networkLogContainer">
            <div className="networkLogHeader">
                <span>TIME</span><span>SOURCE</span><span>PORT</span><span>ACTION</span><span>STATUS</span>
            </div>
            {logs.map((log, i) => (
                <div key={i} className={`networkLogRow ${i === logs.length - 1 ? 'networkLogRowNew' : ''}`}>
                    <span className="logTime">{log.time}</span>
                    <span className="logIp">{log.ip}</span>
                    <span className="logPort">:{log.port}</span>
                    <span className="logAction">{log.action}</span>
                    <span className={`logStatus ${log.status === 'BLOCKED' ? 'logStatusBlocked' : 'logStatusAllowed'}`}>
                        {log.status}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
