import { useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import "../App.css";

const API_URL = "http://localhost:8082";
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const ROTOR_OPTIONS = [1, 2, 3, 4, 5];

const emptyMachine = {
    id: null,
    rotores: [1, 2, 3],
    rotores_settings: ["A", "A", "A"],
    rotores_posiciones: [0, 0, 0],
    cables: [],
    reflector: 1
};

function normaliseMachine(machine) {
    if (!machine) {
        return emptyMachine;
    }

    return {
        ...emptyMachine,
        ...machine,
        rotores: machine.rotores?.length ? machine.rotores : emptyMachine.rotores,
        rotores_settings: machine.rotores_settings?.length
            ? machine.rotores_settings
            : emptyMachine.rotores_settings,
        rotores_posiciones: machine.rotores_posiciones?.length
            ? machine.rotores_posiciones
            : emptyMachine.rotores_posiciones,
        cables: machine.cables || []
    };
}

function cableToLetters(cable) {
    return {
        a: ALPHABET[cable.a] || "?",
        b: ALPHABET[cable.b] || "?"
    };
}

export default function Home() {
    const { accessToken, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [plugboardOpen, setPlugboardOpen] = useState(false);
    const [machine, setMachine] = useState(emptyMachine);
    const [selectedPlug, setSelectedPlug] = useState(null);
    const [lastInput, setLastInput] = useState("");
    const [lastOutput, setLastOutput] = useState("");
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState("Lista para usar");

    const connectedLetters = useMemo(() => {
        const letters = new Set();
        machine.cables.forEach((cable) => {
            letters.add(cable.a);
            letters.add(cable.b);
        });
        return letters;
    }, [machine.cables]);

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        const createMachine = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/m3`, { method: "POST" });

                if (!response.ok) {
                    throw new Error("No se pudo crear la maquina");
                }

                const data = await response.json();
                setMachine(normaliseMachine(data));
                setStatus("Maquina sincronizada con el servidor");
            } catch (error) {
                setStatus("Modo maqueta: backend no disponible");
            }
        };

        createMachine();
    }, [accessToken]);

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    };

    const encryptLetter = async (letter) => {
        setLastInput(letter);

        if (!accessToken || !machine.id) {
            setLastOutput(letter);
            setHistory((current) => [{ input: letter, output: letter }, ...current].slice(0, 12));
            setStatus(accessToken ? "Crea una maquina para cifrar" : "Inicia sesion para cifrar con el servidor");
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}/cifrar`, {
                method: "POST",
                body: letter
            });

            if (!response.ok) {
                throw new Error("No se pudo cifrar");
            }

            const data = await response.json();
            const output = data.letra || letter;

            setMachine(normaliseMachine(data.maquina));
            setLastOutput(output);
            setHistory((current) => [{ input: letter, output }, ...current].slice(0, 12));
            setStatus("Letra cifrada");
        } catch (error) {
            setLastOutput(letter);
            setHistory((current) => [{ input: letter, output: letter }, ...current].slice(0, 12));
            setStatus("No se pudo cifrar con el backend");
        }
    };

    const changeRotor = async (index, value) => {
        const rotores = [...machine.rotores];
        rotores[index] = Number(value);
        setMachine((current) => ({ ...current, rotores }));

        if (!machine.id || !accessToken) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    rotores,
                    ring_settings: machine.rotores_settings
                })
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus("Rotores actualizados");
            }
        } catch (error) {
            setStatus("Cambios guardados solo en pantalla");
        }
    };

    const changeRing = async (index, value) => {
        const ringSettings = [...machine.rotores_settings];
        ringSettings[index] = value;
        setMachine((current) => ({ ...current, rotores_settings: ringSettings }));

        if (!machine.id || !accessToken) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    rotores: machine.rotores,
                    ring_settings: ringSettings
                })
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus("Ajustes de anillo actualizados");
            }
        } catch (error) {
            setStatus("Cambios guardados solo en pantalla");
        }
    };

    const changeReflector = async () => {
        if (!machine.id || !accessToken) {
            setMachine((current) => ({
                ...current,
                reflector: current.reflector === 3 ? 1 : current.reflector + 1
            }));
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PATCH"
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus("Reflector actualizado");
            }
        } catch (error) {
            setStatus("No se pudo cambiar el reflector");
        }
    };

    const connectPlug = async (letter, index) => {
        if (connectedLetters.has(index) || selectedPlug === index) {
            setSelectedPlug(null);
            return;
        }

        if (selectedPlug === null) {
            setSelectedPlug(index);
            return;
        }

        const cable = { a: selectedPlug, b: index };
        setSelectedPlug(null);
        setMachine((current) => ({ ...current, cables: [...current.cables, cable] }));

        if (!machine.id || !accessToken) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}/cables`, {
                method: "POST",
                body: JSON.stringify(cable)
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus(`Cable ${ALPHABET[cable.a]}-${letter} conectado`);
            }
        } catch (error) {
            setStatus("Cable guardado solo en pantalla");
        }
    };

    return (
        <main className="enigma-page">
            <header className="topbar">
                <div className="menu-area">
                    <button
                        className="icon-button menu-button"
                        aria-label="Abrir menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    {menuOpen && (
                        <nav className="side-menu" aria-label="Menu principal">
                            <button>Mi maquina</button>
                            <button>Historial</button>
                            <button>Configuraciones</button>
                            <button>Ayuda</button>
                        </nav>
                    )}
                </div>

                <div className="title-strip">ENIGMA M3</div>

                <div className="user-area">
                    {accessToken ? (
                        <>
                            <span className="session-dot" aria-label="Sesion iniciada" />
                            <button className="avatar-button" onClick={logout} title="Cerrar sesion">
                                G
                            </button>
                        </>
                    ) : (
                        <button className="login-button" onClick={loginWithGoogle}>
                            Google
                        </button>
                    )}
                </div>
            </header>

            <section className="enigma-shell" aria-label="Maquina Enigma">
                <p className="status-line">{status}</p>

                <div className="machine-panel">
                    <div className="rotor-bank" aria-label="Rotores">
                        {machine.rotores.map((rotor, index) => (
                            <div className="rotor" key={`rotor-${index}`}>
                                <span>{rotor}</span>
                                <strong>
                                    {ALPHABET[machine.rotores_posiciones[index] || 0] ||
                                        machine.rotores_settings[index]}
                                </strong>
                            </div>
                        ))}
                    </div>

                    <div className="panel-actions">
                        <button onClick={() => setSettingsOpen((open) => !open)}>
                            Rotores
                        </button>
                        <button onClick={changeReflector}>Reflector {machine.reflector}</button>
                    </div>

                    {settingsOpen && (
                        <div className="settings-panel">
                            {machine.rotores.map((rotor, index) => (
                                <label key={`setting-${index}`}>
                                    R{index + 1}
                                    <select
                                        value={rotor}
                                        onChange={(event) => changeRotor(index, event.target.value)}
                                    >
                                        {ROTOR_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={machine.rotores_settings[index] || "A"}
                                        onChange={(event) => changeRing(index, event.target.value)}
                                    >
                                        {ALPHABET.map((letter) => (
                                            <option key={letter} value={letter}>
                                                {letter}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ))}
                        </div>
                    )}

                    <section className="output-window" aria-label="Letra traducida">
                        {lastOutput || "-"}
                    </section>

                    <section className="keyboard" aria-label="Teclado">
                        {KEY_ROWS.map((row) => (
                            <div className="key-row" key={row}>
                                {row.split("").map((letter) => (
                                    <button
                                        className={letter === lastInput ? "key active" : "key"}
                                        key={letter}
                                        onClick={() => encryptLetter(letter)}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </section>

                    <section className="plugboard" aria-label="Cables">
                        <div className="plugboard-header">
                            <span>Cables</span>
                            <button onClick={() => setPlugboardOpen((open) => !open)}>
                                {plugboardOpen ? "Cerrar" : "Editar"}
                            </button>
                        </div>

                        {plugboardOpen ? (
                            <div className="plug-grid">
                                {ALPHABET.map((letter, index) => (
                                    <button
                                        className={[
                                            "plug",
                                            connectedLetters.has(index) ? "connected" : "",
                                            selectedPlug === index ? "selected" : ""
                                        ].join(" ")}
                                        key={letter}
                                        onClick={() => connectPlug(letter, index)}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="cable-list">
                                {machine.cables.length ? (
                                    machine.cables.map((cable, index) => {
                                        const letters = cableToLetters(cable);
                                        return (
                                            <span key={`${letters.a}-${letters.b}-${index}`}>
                                                {letters.a}-{letters.b}
                                            </span>
                                        );
                                    })
                                ) : (
                                    <span>Sin conexiones</span>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </section>

            <section className="notebook" aria-label="Libreta de traduccion">
                <div className="notebook-line" />
                <div className="notebook-columns">
                    <div>
                        <h2>Entrada</h2>
                        {history.map((item, index) => (
                            <span key={`input-${index}`}>{item.input}</span>
                        ))}
                    </div>
                    <div>
                        <h2>Salida</h2>
                        {history.map((item, index) => (
                            <span key={`output-${index}`}>{item.output}</span>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
