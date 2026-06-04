import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuth } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import rotorPreview from "../assets/fondo_rugoso.png";
import keyA from "../assets/a.png";
import keyB from "../assets/b.png";
import keyC from "../assets/c.png";
import keyD from "../assets/d.png";
import keyE from "../assets/e.png";
import keyF from "../assets/f.png";
import keyG from "../assets/g.png";
import keyH from "../assets/h.png";
import keyI from "../assets/i.png";
import keyJ from "../assets/j.png";
import keyK from "../assets/k.png";
import keyL from "../assets/l.png";
import keyM from "../assets/m.png";
import keyN from "../assets/n.png";
import keyO from "../assets/o.png";
import keyP from "../assets/p.png";
import keyQ from "../assets/q.png";
import keyR from "../assets/r.png";
import keyS from "../assets/s.png";
import keyT from "../assets/t.png";
import keyU from "../assets/u.png";
import keyV from "../assets/v.png";
import keyW from "../assets/w.png";
import keyX from "../assets/x.png";
import keyY from "../assets/y.png";
import keyZ from "../assets/z.png";
import "../App.css";

const API_URL = "http://localhost:8082";
const HISTORY_LIMIT = 60;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const KEY_ROWS = ["QWERTZUIO", "ASDFGHJK", "PYXCVBNML"];
const KEY_IMAGES = {
    A: keyA,
    B: keyB,
    C: keyC,
    D: keyD,
    E: keyE,
    F: keyF,
    G: keyG,
    H: keyH,
    I: keyI,
    J: keyJ,
    K: keyK,
    L: keyL,
    M: keyM,
    N: keyN,
    O: keyO,
    P: keyP,
    Q: keyQ,
    R: keyR,
    S: keyS,
    T: keyT,
    U: keyU,
    V: keyV,
    W: keyW,
    X: keyX,
    Y: keyY,
    Z: keyZ
};
const ROTOR_OPTIONS = [0, 1, 2, 3, 4];
const MACHINE_MODES = {
    cifrar: {
        label: "Cifrar",
        endpoint: "cifrar",
        statusReady: "Crea una máquina para cifrar",
        statusDone: "Letra cifrada",
        statusError: "No se pudo cifrar con el backend",
        requestError: "No se pudo cifrar"
    },
    descifrar: {
        label: "Descifrar",
        endpoint: "descifrar",
        statusReady: "Crea una máquina para descifrar",
        statusDone: "Letra descifrada",
        statusError: "No se pudo descifrar con el backend",
        requestError: "No se pudo descifrar"
    }
};
const CABLE_COLORS = [
    "#d95f43",
    "#4f8fba",
    "#d0a13b",
    "#7c63b8",
    "#4f9a66",
    "#c84f7a",
    "#3f8f8a",
    "#9b6b3d",
    "#536fb3",
    "#7d8b38",
    "#d555d5",
    "#e66525",
    "#222275"
];

const emptyMachine = {
    id: null,
    rotores: [0, 1, 2],
    rotores_settings: ["A", "A", "A"],
    rotores_posiciones: [0, 0, 0],
    cables: [],
    reflector: 1
};

const rotorNames = {
    0: "I",
    1: "II",
    2: "III",
    3: "IV",
    4: "V"
};

function normaliseMachine(machine) {
    if (!machine) {
        return emptyMachine;
    }

    return {
        ...emptyMachine,
        ...machine,
        rotores: machine.rotores?.length
            ? machine.rotores.map((rotor) => Number(rotor))
            : emptyMachine.rotores,
        rotores_settings: machine.rotores_settings?.length
            ? machine.rotores_settings
            : emptyMachine.rotores_settings,
        rotores_posiciones: machine.rotores_posiciones?.length
            ? machine.rotores_posiciones.map((position) => Number(position))
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

function getCableKey(cable) {
    return [cable.a, cable.b].sort((a, b) => a - b).join("-");
}

function getCableColor(index) {
    return CABLE_COLORS[index % CABLE_COLORS.length];
}

function getTokenPayload(token) {
    if (!token) {
        return null;
    }

    try {
        const payload = token.split(".")[1];
        const base64Payload = payload.replace(/-/g, "+").replace(/_/g, "/");
        const paddedPayload = base64Payload.padEnd(
            base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
            "="
        );
        const decodedPayload = JSON.parse(atob(paddedPayload));
        return decodedPayload;
    } catch (error) {
        return null;
    }
}

function getTokenSubject(token) {
    return getTokenPayload(token)?.sub || null;
}

function getTokenPicture(token) {
    return getTokenPayload(token)?.picture || null;
}

function getHistoryStorageKey(accessToken) {
    const subject = getTokenSubject(accessToken);
    return subject ? `enigma-history:${subject}` : null;
}

function loadSavedHistory(storageKey) {
    if (!storageKey) {
        return [];
    }

    try {
        const savedHistory = JSON.parse(localStorage.getItem(storageKey));
        return Array.isArray(savedHistory) ? savedHistory.slice(0, HISTORY_LIMIT) : [];
    } catch (error) {
        return [];
    }
}

function normaliseSteps(steps) {
    if (Array.isArray(steps)) {
        return steps;
    }

    if (typeof steps === "string" && steps.trim()) {
        return [steps];
    }

    return [];
}

function HowWorksPage() {
    const [activeInfo, setActiveInfo] = useState(null);

    return (
        <section
            className={activeInfo ? "how-page is-inspecting" : "how-page"}
            aria-label="Como funciona"
        >
            <section className="intro-panel how-intro" aria-label="Introduccion">
                <div>
                    <p className="eyebrow">Guía de componentes</p>
                    <h1>¿Cómo funciona?</h1>
                    <p>
                        La máquina Enigma transforma cada letra pasando la señal por varios
                        componentes mecánicos y eléctricos.
                    </p>
                    <p>
                        Cuenta con 3 rotores, 1 reflector y 26 entradas para conexión posibles,
                        una para cada letra del abecedario.
                    </p>
                </div>
                <div className="intro-notes how-jump-buttons">
                    {Array.from({ length: 6 }, (_, index) => (
                        <button type="button" key={`how-button-${index + 1}`}>
                            Boton {index + 1}
                        </button>
                    ))}
                </div>
            </section>

            <div
                className="component-row"
                id="how-rotors"
            >
                <article
                    className="component-card rotor-card"
                    onMouseEnter={() => setActiveInfo("rotors")}
                    onMouseLeave={() => setActiveInfo(null)}
                >
                    <h2>Rotores</h2>
                    <p>
                        Los rotores cambian la letra segun su cableado interno, su ajuste
                        de anillo y la posicion actual.
                    </p>
                    <p>
                        En nuestra maquina son las tres ruedas superiores que avanzan al
                        cifrar o descifrar.
                    </p>

                    <aside className="component-tab" aria-hidden={activeInfo !== "rotors"}>
                        <img src={rotorPreview} alt="" />
                        <div>
                            <h3>En nuestra maquina</h3>
                            <p>
                                Esta zona representa los tres rotores: tipo, posicion visible
                                y avance de la senal.
                            </p>
                        </div>
                    </aside>
                </article>

                <div className="component-image panel-preview">
                    <img src={rotorPreview} alt="Vista provisional de los rotores" />
                </div>
            </div>

            <div
                className="component-row reverse"
                id="how-reflector"
            >
                <div className="component-image panel-preview">
                    <img src={rotorPreview} alt="Vista provisional del reflector" />
                </div>

                <article className="component-card">
                    <h2>Reflector</h2>
                    <p>
                        El reflector devuelve la senal por el camino inverso, haciendo que
                        el proceso pueda usarse para cifrar y descifrar.
                    </p>
                    <p>
                        En el simulador puedes alternar entre los dos reflectores desde el
                        control de la maquina.
                    </p>
                </article>
            </div>
        </section>
    );
}

export default function Home() {
    const { accessToken, logout } = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [plugboardOpen, setPlugboardOpen] = useState(false);
    const [machine, setMachine] = useState(emptyMachine);
    const [selectedPlug, setSelectedPlug] = useState(null);
    const [lastOutput, setLastOutput] = useState("");
    const [sessionHistory, setSessionHistory] = useState([]);
    const [allTimeHistory, setAllTimeHistory] = useState([]);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [stepsOpen, setStepsOpen] = useState(false);
    const [lastSteps, setLastSteps] = useState([]);
    const [status, setStatus] = useState("Lista para usar");
    const [machineMode, setMachineMode] = useState("cifrar");
    const [activePage, setActivePage] = useState("machine");
    const [pulseTarget, setPulseTarget] = useState("");
    const skipNextHistorySave = useRef(false);
    const isLoggedIn = Boolean(accessToken);
    const userEmail = useMemo(() => getTokenSubject(accessToken), [accessToken]);
    const userPicture = useMemo(() => getTokenPicture(accessToken), [accessToken]);
    const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";
    const historyStorageKey = useMemo(() => getHistoryStorageKey(accessToken), [accessToken]);

    const cablePairs = useMemo(() => {
        const seen = new Set();
        return machine.cables.filter((cable) => {
            const key = getCableKey(cable);

            if (seen.has(key)) {
                return false;
            }

            seen.add(key);
            return true;
        });
    }, [machine.cables]);

    const connectedLetters = useMemo(() => {
        const letters = new Map();
        cablePairs.forEach((cable, index) => {
            const color = getCableColor(index);
            letters.set(cable.a, { cable, color });
            letters.set(cable.b, { cable, color });
        });
        return letters;
    }, [cablePairs]);

    const latestSteps = useMemo(() => {
        return lastSteps.length ? lastSteps : normaliseSteps(sessionHistory[0]?.steps);
    }, [lastSteps, sessionHistory]);

    useEffect(() => {
        const createMachine = async () => {
            try {
                const response = await fetchWithAuth(`${API_URL}/m3`, { method: "POST" });

                if (!response.ok) {
                    throw new Error("No se pudo crear la maquina");
                }

                const data = await response.json();
                setMachine(normaliseMachine(data));
                setStatus(isLoggedIn ? "Maquina sincronizada con el servidor" : "Modo invitado");
            } catch (error) {
                setStatus("Modo maqueta: backend no disponible");
            }
        };

        createMachine();
    }, [isLoggedIn]);

    useEffect(() => {
        skipNextHistorySave.current = true;
        setAllTimeHistory(loadSavedHistory(historyStorageKey));
        setSessionHistory([]);
        setLastSteps([]);
        setHistoryOpen(false);
        setStepsOpen(false);
        setAccountMenuOpen(false);
    }, [historyStorageKey]);

    useEffect(() => {
        if (skipNextHistorySave.current) {
            skipNextHistorySave.current = false;
            return;
        }

        if (historyStorageKey) {
            localStorage.setItem(historyStorageKey, JSON.stringify(allTimeHistory.slice(0, HISTORY_LIMIT)));
        }
    }, [allTimeHistory, historyStorageKey]);

    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/oauth2/authorization/google`;
    };

    const saveHistoryEntry = (entry) => {
        setSessionHistory((current) => [entry, ...current].slice(0, HISTORY_LIMIT));

        if (historyStorageKey) {
            setAllTimeHistory((current) => [entry, ...current].slice(0, HISTORY_LIMIT));
        }
    };

    const openHistory = () => {
        setHistoryOpen(true);
        setAccountMenuOpen(false);
    };

    const closeSession = () => {
        setAccountMenuOpen(false);
        setHistoryOpen(false);
        logout();
    };

    const encryptLetter = async (letter) => {
        const mode = MACHINE_MODES[machineMode];
        setStepsOpen(false);

        if (!machine.id) {
            const fallbackSteps = ["No hay pasos disponibles porque todavia no hay maquina creada."];
            setLastOutput(letter);
            setLastSteps(fallbackSteps);
            saveHistoryEntry({
                input: letter,
                output: letter,
                steps: fallbackSteps
            });
            setStatus(mode.statusReady);
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}/${mode.endpoint}`, {
                method: "POST",
                body: letter
            });

            if (!response.ok) {
                throw new Error(mode.requestError);
            }

            const data = await response.json();
            const output = data.letra || letter;
            const steps = normaliseSteps(data.pasos);

            setMachine(normaliseMachine(data.maquina));
            setLastOutput(output);
            setLastSteps(steps);
            saveHistoryEntry({
                input: letter,
                output,
                mode: mode.label,
                steps
            });
            setStatus(mode.statusDone);
        } catch (error) {
            const errorSteps = [`No se pudieron recuperar los pasos porque fallo la peticion de ${mode.label.toLowerCase()}.`];
            setLastOutput(letter);
            setLastSteps(errorSteps);
            saveHistoryEntry({
                input: letter,
                output: letter,
                mode: mode.label,
                steps: errorSteps
            });
            setStatus(mode.statusError);
        }
    };

    const changeRotor = async (index, value) => {
        const rotores = [...machine.rotores];
        rotores[index] = Number(value);
        setMachine((current) => ({ ...current, rotores }));

        if (!machine.id) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    rotores,
                    ring_settings: machine.rotores_settings,
                    rotor_positions: machine.rotores_posiciones
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

        if (!machine.id) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    rotores: machine.rotores,
                    ring_settings: ringSettings,
                    rotor_positions: machine.rotores_posiciones
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

    const changeRotorPosition = async (index, value) => {
        const rotorPositions = [...machine.rotores_posiciones];
        rotorPositions[index] = Number(value);
        setMachine((current) => ({ ...current, rotores_posiciones: rotorPositions }));

        if (!machine.id) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    rotores: machine.rotores,
                    ring_settings: machine.rotores_settings,
                    rotor_positions: rotorPositions
                })
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus("Posiciones de rotores actualizadas");
            }
        } catch (error) {
            setStatus("Cambios guardados solo en pantalla");
        }
    };

    const changeReflector = async () => {
        if (!machine.id) {
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

    const removeCable = async (cable) => {
        const cableKey = getCableKey(cable);
        setSelectedPlug(null);
        setMachine((current) => ({
            ...current,
            cables: current.cables.filter((currentCable) => getCableKey(currentCable) !== cableKey)
        }));

        if (!machine.id) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_URL}/m3/${machine.id}/cables`, {
                method: "DELETE",
                body: JSON.stringify({ a: cable.a, b: cable.b })
            });

            if (response.ok) {
                setMachine(normaliseMachine(await response.json()));
                setStatus(`Cable ${ALPHABET[cable.a]}-${ALPHABET[cable.b]} desconectado`);
            }
        } catch (error) {
            setStatus("Cable eliminado solo en pantalla");
        }
    };

    const connectPlug = async (letter, index) => {
        const connectedCable = connectedLetters.get(index);

        if (connectedCable) {
            removeCable(connectedCable.cable);
            return;
        }

        if (selectedPlug === index) {
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

        if (!machine.id) {
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

    const jumpToSection = (target) => {
        if (target === "rotors") {
            setSettingsOpen(true);
        }

        setPulseTarget("");
        requestAnimationFrame(() => {
            const element = document.getElementById(`jump-${target}`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
            setPulseTarget(target);
            window.setTimeout(() => setPulseTarget(""), 900);
        });
    };

    return (
        <main className="enigma-page">
            <header className="topbar">
                <nav className="main-tabs" aria-label="Navegacion principal">
                    <button type="button" onClick={() => setActivePage("machine")}>
                        Máquina Enigma
                    </button>
                    <button type="button" onClick={() => setActivePage("how")}>
                        ¿Cómo funciona?
                    </button>
                    <button type="button">Historia</button>
                    <button type="button">German Book</button>
                    <button type="button">Retos</button>
                </nav>

                <div className="title-strip">MAQUINA ENIGMA M3</div>

                <div className="user-area">
                    <div className="auth-row">
                        {accessToken ? (
                            <>
                                <span className="session-dot" aria-label="Sesion iniciada" />
                                <button
                                    className="account-button"
                                    onClick={() => setAccountMenuOpen((open) => !open)}
                                    title={userEmail || "Cuenta"}
                                >
                                    <span>{userEmail}</span>
                                    {userPicture ? (
                                        <img src={userPicture} alt="" referrerPolicy="no-referrer" />
                                    ) : (
                                        <strong aria-hidden="true">{userInitial}</strong>
                                    )}
                                </button>
                                {accountMenuOpen && (
                                    <div className="account-menu">
                                        <button onClick={openHistory}>Historial</button>
                                        <button onClick={closeSession}>Cerrar sesion</button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="session-dot logged-out" aria-label="Sesion no iniciada" />
                                <button className="login-button" onClick={loginWithGoogle}>
                                    Iniciar sesión
                                </button>
                            </>
                        )}
                    </div>
                    <button className="accessibility-button" type="button" aria-label="Accesibilidad">
                        <span aria-hidden="true" />
                    </button>
                </div>
            </header>

            {activePage === "how" ? (
                <HowWorksPage />
            ) : (
                <>
            <section className="intro-panel" aria-label="Introduccion">
                <div>
                    <p className="eyebrow">Simulador interactivo</p>
                    <h1>Enigma M3</h1>
                    <p>
                        Una máquina de cifrado por rotores donde cada letra atraviesa el
                        teclado, el panel de conexiones, los rotores y el reflector antes de
                        volver transformada.
                    </p>
                </div>
                <div className="intro-notes">
                    <button type="button" onClick={() => jumpToSection("rotors")}>
                        Rotores configurables
                    </button>
                    <button type="button" onClick={() => jumpToSection("cipher")}>
                        Cifrado y descifrado
                    </button>
                    <button type="button" onClick={() => jumpToSection("history")}>
                        Historial de sesión
                    </button>
                </div>
            </section>

            <section className="enigma-shell" aria-label="Maquina Enigma">
                <p className="status-line">{status}</p>

                <div className="machine-panel">
                    <div
                        id="jump-cipher"
                        className={
                            pulseTarget === "cipher"
                                ? "panel-actions jump-pulse"
                                : "panel-actions"
                        }
                    >
                        <label className="mode-selector">
                            <span>Modo</span>
                            <select
                                value={machineMode}
                                onChange={(event) => setMachineMode(event.target.value)}
                            >
                                {Object.entries(MACHINE_MODES).map(([value, mode]) => (
                                    <option key={value} value={value}>
                                        {mode.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            className={pulseTarget === "rotors" ? "jump-pulse" : ""}
                            onClick={() => setSettingsOpen((open) => !open)}
                        >
                            Rotores
                        </button>
                        <button onClick={changeReflector}>Reflector {machine.reflector}</button>
                    </div>

                    <div
                        id="jump-rotors"
                        className={
                            pulseTarget === "rotors" ? "rotor-bank jump-pulse" : "rotor-bank"
                        }
                        aria-label="Rotores"
                    >
                        {machine.rotores.map((rotor, index) => (
                            <div className="rotor" key={`rotor-${index}`}>
                                <span>{rotorNames[rotor]}</span>
                                <strong>
                                    {ALPHABET[machine.rotores_posiciones[index] || 0] ||
                                        machine.rotores_settings[index]}
                                </strong>
                            </div>
                        ))}
                    </div>


                    {settingsOpen && (
                        <div
                            className={
                                pulseTarget === "rotors"
                                    ? "settings-panel jump-pulse"
                                    : "settings-panel"
                            }
                        >
                            {machine.rotores.map((rotor, index) => (
                                <div className="settings-column" key={`setting-${index}`}>
                                    <span>R{index + 1}</span>
                                    <select
                                        aria-label={`Rotor ${index + 1}`}
                                        value={String(rotor)}
                                        onChange={(event) => changeRotor(index, event.target.value)}
                                    >
                                        {ROTOR_OPTIONS.map((option) => (
                                            <option key={option} value={String(option)}>
                                                {rotorNames[option]}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        aria-label={`Ajuste de anillo R${index + 1}`}
                                        value={machine.rotores_settings[index] || "A"}
                                        onChange={(event) => changeRing(index, event.target.value)}
                                    >
                                        {ALPHABET.map((letter) => (
                                            <option key={letter} value={letter}>
                                                {letter}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        aria-label={`Posicion actual R${index + 1}`}
                                        value={String(machine.rotores_posiciones[index] || 0)}
                                        onChange={(event) =>
                                            changeRotorPosition(index, event.target.value)
                                        }
                                    >
                                        {ALPHABET.map((letter, position) => (
                                            <option key={letter} value={String(position)}>
                                                {letter}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                        className="key"
                                        style={{ "--key-image": `url(${KEY_IMAGES[letter]})` }}
                                        aria-label={`Tecla ${letter}`}
                                        key={letter}
                                        onClick={() => encryptLetter(letter)}
                                    >
                                        <span className="key-letter">{letter}</span>
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
                                        style={{
                                            "--cable-color": connectedLetters.get(index)?.color
                                        }}
                                        key={letter}
                                        onClick={() => connectPlug(letter, index)}
                                        title={
                                            connectedLetters.has(index)
                                                ? "Quitar cable"
                                                : "Conectar cable"
                                        }
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="cable-list">
                                {cablePairs.length ? (
                                    cablePairs.map((cable, index) => {
                                        const letters = cableToLetters(cable);
                                        return (
                                            <button
                                                className="cable-chip"
                                                key={getCableKey(cable)}
                                                onClick={() => removeCable(cable)}
                                                style={{"--cable-color": getCableColor(index)}}
                                                title="Quitar cable"
                                            >
                                                {letters.a}-{letters.b}
                                            </button>
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

            <section
                id="jump-history"
                className={pulseTarget === "history" ? "notebook jump-pulse" : "notebook"}
                aria-label="Libreta de traduccion"
            >
                <div className="notebook-line"/>
                <div className="notebook-columns">
                    <div>
                        <h2>Entrada</h2>
                        {sessionHistory.map((item, index) => (
                            <span key={`input-${index}`}>{item.input}</span>
                        ))}
                    </div>
                    <div>
                        <h2>Salida</h2>
                        {sessionHistory.map((item, index) => (
                            <span key={`output-${index}`}>{item.output}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="steps-area" aria-label="Pasos de cifrado">
                <button
                    className="steps-toggle"
                    onClick={() => setStepsOpen((open) => !open)}
                    disabled={!latestSteps.length}
                >
                    {stepsOpen ? "Ocultar pasos seguidos" : "Mostrar pasos seguidos"}
                </button>

                {stepsOpen && (
                    <div className="steps-panel">
                        <h2>
                            {sessionHistory[0]
                                ? `${sessionHistory[0].input} -> ${sessionHistory[0].output}`
                                : "Sin letra cifrada"}
                        </h2>
                        {latestSteps.length ? (
                            <ol>
                                {latestSteps.map((step, index) => (
                                    <li key={`step-${index}`}>{step}</li>
                                ))}
                            </ol>
                        ) : (
                            <p>No hay pasos disponibles para esta letra.</p>
                        )}
                    </div>
                )}
            </section>
                </>
            )}

            {historyOpen && (
                <section className="history-panel" aria-label="Historial completo">
                    <div className="history-panel-header">
                        <h2>Historial</h2>
                        <button onClick={() => setHistoryOpen(false)}>Cerrar</button>
                    </div>
                    <div className="history-columns">
                        <div>
                            <h3>Sesion</h3>
                            {sessionHistory.length ? (
                                sessionHistory.map((item, index) => (
                                    <span key={`session-history-${index}`}>
                                        {item.input}-{item.output}
                                    </span>
                                ))
                            ) : (
                                <p>Sin letras en esta sesion</p>
                            )}
                        </div>
                        <div>
                            <h3>Todos</h3>
                            {allTimeHistory.length ? (
                                allTimeHistory.map((item, index) => (
                                    <span key={`all-history-${index}`}>
                                        {item.input}-{item.output}
                                    </span>
                                ))
                            ) : (
                                <p>Sin historial guardado</p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <footer className="site-footer">
                Máquina Enigma - Gabriel Novo Vila
            </footer>
        </main>
    );
}
