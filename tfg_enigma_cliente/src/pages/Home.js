import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuth } from "../services/api";
import { useAuth } from "../auth/AuthContext";
import rotorPreview from "../assets/Enigma_rotor_set.png";
import rotorWheel from "../assets/rueda.png";
import rotorSettingsPreview from "../assets/mis_rotores.png";
import reflectorPreview from "../assets/reflector.png";
import keyboardPreview from "../assets/teclado.jpg";
import plugboardPreview from "../assets/espacio_conexiones.png";
import lampsPreview from "../assets/bombillas.jpg";
import myKeyboardPreview from "../assets/mi_teclado.png";
import myPlugboardEmptyPreview from "../assets/mis_cables_no.png";
import myPlugboardActivePreview from "../assets/mis_cables_si.png";
import myOutputPreview from "../assets/mi_salida.png";
import codeBookPreview from "../assets/libro_codificacion.png";
import accessibilityIcon from "../assets/accesibilidad.png";
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
const COLORBLIND_CABLE_COLORS = [
    "#0072b2",
    "#e69f00",
    "#009e73",
    "#d55e00",
    "#cc79a7",
    "#56b4e9",
    "#f0e442",
    "#000000",
    "#3b5ba9",
    "#a65628",
    "#6a3d9a",
    "#1b9e77",
    "#e7298a"
];
const FONT_SCALE_MIN = 85;
const FONT_SCALE_MAX = 125;
const FONT_SCALE_STEP = 10;
const ROMAN_NUMERALS = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII"
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

const reflectorNames = {
    0: "B",
    1: "C"
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

function getCableColor(index, colorblindMode = false) {
    const colors = colorblindMode ? COLORBLIND_CABLE_COLORS : CABLE_COLORS;
    return colors[index % colors.length];
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

function GuideSection({
    number,
    id,
    title,
    description,
    summary,
    paragraphs,
    subsectionTitles,
    preview,
    previewAlt,
    previewCaption,
    machineImages = [],
    machineText,
    activeInfo,
    setActiveInfo,
    openCard,
    setOpenCard,
    pulseTarget
}) {
    const isOpen = openCard === id;
    const isActive = activeInfo === id;

    return (
        <>
            <header className="component-section-heading">
                <span>{number}</span>
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                </div>
            </header>

            <div
                className={[
                    "component-row",
                    "guide-component-row",
                    isOpen ? "has-open-card" : "",
                    pulseTarget === id ? "jump-pulse" : ""
                ].filter(Boolean).join(" ")}
                id={`how-${id}`}
            >
                <article
                    className={[
                        "component-card",
                        "guide-card",
                        "folded-card",
                        isOpen ? "is-open" : ""
                    ].filter(Boolean).join(" ")}
                    onClick={() => setOpenCard((current) => current === id ? null : id)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOpenCard((current) => current === id ? null : id);
                        }
                    }}
                    role="button"
                    tabIndex="0"
                >
                    <h2>{title}</h2>
                    <p className="open-card-summary">{summary}</p>
                    {!isOpen && <span className="folded-card-hint">Ver más sobre {title.toLowerCase()}</span>}
                    <div className="component-copy">
                        {paragraphs.map((paragraph, index) => (
                            <p
                                data-title={subsectionTitles[index]}
                                key={`${id}-paragraph-${index}`}
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </article>

                <figure
                    className="component-image panel-preview"
                    onMouseEnter={() => setActiveInfo(id)}
                    onMouseLeave={() => setActiveInfo(null)}
                >
                    <img src={preview} alt={previewAlt} />
                    <figcaption>{previewCaption}</figcaption>
                    <aside
                        className={isActive ? "component-tab image-info-tab is-visible" : "component-tab image-info-tab"}
                        aria-hidden={!isActive}
                    >
                        {machineImages.length > 0 && (
                            <div className="component-tab-gallery">
                                {machineImages.map((image) => (
                                    <figure key={image.caption}>
                                        <img src={image.src} alt={image.alt} />
                                        <figcaption>{image.caption}</figcaption>
                                    </figure>
                                ))}
                            </div>
                        )}
                        <div className="component-tab-copy">
                            <h3>En nuestra máquina</h3>
                            {machineText.map((paragraph, index) => <p key={`${id}-machine-${index}`}>{paragraph}</p>)}
                        </div>
                    </aside>
                </figure>
            </div>
        </>
    );
}

function HowWorksPage() {
    const [activeInfo, setActiveInfo] = useState(null);
    const [openCard, setOpenCard] = useState(null);
    const [pulseTarget, setPulseTarget] = useState("");

    const jumpToComponent = (target) => {
        setPulseTarget("");
        requestAnimationFrame(() => {
            document.getElementById(`how-${target}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            setPulseTarget(target);
            window.setTimeout(() => setPulseTarget(""), 900);
        });
    };

    return (
        <section
            className={activeInfo || openCard ? "how-page is-inspecting" : "how-page"}
            aria-label="Como funciona"
        >
            {openCard && (
                <button
                    className="open-card-backdrop"
                    type="button"
                    aria-label="Cerrar explicación"
                    onClick={() => setOpenCard(null)}
                />
            )}
            <section className="intro-panel how-intro" aria-label="Introduccion">
                <div>
                    <p className="eyebrow">Guía de componentes</p>
                    <h1>¿Cómo funciona?</h1>
                    <p>
                        La máquina Enigma transforma cada letra pasando la señal por varios
                        componentes mecánicos y eléctricos.
                    </p>
                    <p>
                        Esta es una máquina M3, por lo que cuenta con 3 rotores, 1 reflector y
                        26 entradas para conexión posibles, una para cada letra del abecedario.
                        En la sección "Historia" se habla sobre otros tipos de Máquina Enigma.
                    </p>
                </div>
                <div className="intro-notes how-jump-buttons">
                    <button type="button" onClick={() => jumpToComponent("rotors")}>
                        Rotores
                    </button>
                    <button type="button" onClick={() => jumpToComponent("reflector")}>
                        Reflector
                    </button>
                    <button type="button" onClick={() => jumpToComponent("keyboard")}>
                        Teclado
                    </button>
                    <button type="button" onClick={() => jumpToComponent("plugboard")}>
                        Espacio de conexiones
                    </button>
                    <button type="button" onClick={() => jumpToComponent("output")}>
                        Salida
                    </button>
                    <button type="button" onClick={() => jumpToComponent("flow")}>
                        Flujo completo
                    </button>
                </div>
            </section>

            <header className="component-section-heading">
                <span>01</span>
                <div>
                    <h2>Rotores</h2>
                    <p>
                        Los componentes móviles que transforman cada letra y avanzan con cada pulsación.
                    </p>
                </div>
            </header>

            <div
                className={[
                    "component-row",
                    "rotor-component-row",
                    openCard === "rotors" ? "has-open-card" : "",
                    pulseTarget === "rotors" ? "jump-pulse" : ""
                ].filter(Boolean).join(" ")}
                id="how-rotors"
            >
                <article
                    className={[
                        "component-card",
                        "rotor-card",
                        "folded-card",
                        openCard === "rotors" ? "is-open" : ""
                    ].filter(Boolean).join(" ")}
                    onClick={() => setOpenCard((current) => current === "rotors" ? null : "rotors")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOpenCard((current) => current === "rotors" ? null : "rotors");
                        }
                    }}
                    role="button"
                    tabIndex="0"
                >
                    <h2>Rotores</h2>
                    <p className="open-card-summary">
                        Cómo transforman las letras, avanzan con cada pulsación y modifican el cifrado.
                    </p>
                    {openCard !== "rotors" && (
                        <span className="folded-card-hint">Ver más sobre los rotores</span>
                    )}
                    <div className="component-copy">
                    <p>
                        Cada rotor contiene un tipo, un alfabeto propio, una posición inicial,
                        una actual y una posición de cambio. Dependiendo del tipo de máquina,
                        hay unos tipos de rotor u otros y este influye en su alfabeto y en la posición de cambio.
                    </p>
                    <p>
                        La función del rotor es cifrar una letra en base al alfabeto que contiene.
                        A este le llega una entrada, que es una letra y devolverá una distinta.
                        Cada letra de entrada tiene asociada otra de salida, de forma que podemos tener A → H, B → D, etc.
                    </p>
                    <p>
                        Ahora vamos a complicarlo un poco más, los rotores de las máquinas enigma giran para cambiar de posición.
                        Cada vez que pulsas una letra en el teclado, el que llamaremos el primer rotor (el situado más a la derecha), gira.
                        Si, por ejemplo, los rotores están en una posición A A A
                        (La letra asociada a la posición del primer rotor es A, la del segundo, es A y la del tercero, es A),
                        si cifras o descifras una letra, pasarán a A A B. Luego a A A C y así continuamente.
                        Dependiendo del tipo de rotor, este tendrá una posición de cambio. Si la posición de cambio es H,
                        al llegar a H, cambiará el siguiente rotor. Así, tendríamos la siguiente secuencia:
                        A A F → A A G → A B H → A B I, cuando vuelva a llegar a H, volverá a cambiar el siguiente.
                    </p>
                    <p>
                        ¿Cuál es el efecto de estas posiciones?
                        Pues bien, además de estas, existe una posición inicial para cada rotor,
                        que nos indica el desplazamiento para el alfabeto.
                        La forma más fácil de entenderlo es pasando las letras a números.
                        Imaginemos que al rotor llega la letra 1 (A).
                        Este rotor está en una posición 3 (C) y su posición inicial era 2 (B).
                        Como hay un cambio de 1 posición entre la actual y la inicial (3-2=1),
                        el rotor actúa como si, en lugar de llegar la letra A, llegara la letra B (1+1=2).
                        Se devuelve la letra asociada a la B. Imaginemos que es la M la letra asociada a la B.
                        Ahora, se le restaría la diferencia que antes se sumó. Antes sumamos la letra que llegó (A+1=B),
                        ahora lo restamos (M-1=N), en este ejemplo, si entrara una A,
                        devolvería una N. Este ejemplo era de cifrado.
                        En un caso de descifrado, primero se resta y luego se suma.
                    </p>

                    </div>

                </article>

                <figure
                    className="component-image panel-preview"
                    onMouseEnter={() => setActiveInfo("rotors")}
                    onMouseLeave={() => setActiveInfo(null)}
                >
                    <img src={rotorPreview} alt="Imagen de los rotores"/>
                    <figcaption>Imagen representativa de los rotores de la máquina Enigma.</figcaption>
                    <aside
                        className={activeInfo === "rotors" ? "component-tab image-info-tab is-visible" : "component-tab image-info-tab"}
                        aria-hidden={activeInfo !== "rotors"}
                    >
                        <figure>
                            <img
                                src={rotorSettingsPreview}
                                alt="Tabla de ajustes de rotores de nuestra maquina"
                            />
                            <figcaption>Ajustes de los rotores en nuestra máquina M3</figcaption>
                        </figure>
                        <div className="component-tab-copy">
                            <h3>En nuestra máquina</h3>
                            <p>
                                Al ser una Enigma M3, puedes elegir entre cinco tipos de rotor:
                                I, II, III, IV y V.
                            </p>
                            <p>
                                Cada columna corresponde a uno de los tres rotores. La primera
                                fila selecciona su tipo, la segunda configura la posición
                                inicial del anillo y la tercera cambia su posición actual.
                            </p>
                        </div>
                    </aside>
                </figure>
            </div>

            <header className="component-section-heading">
                <span>02</span>
                <div>
                    <h2>Reflector</h2>
                    <p>
                        El componente fijo que devuelve la señal para completar el recorrido de cifrado.
                    </p>
                </div>
            </header>

            <div
                className={[
                    "component-row",
                    "reflector-component-row",
                    openCard === "reflector" ? "has-open-card" : "",
                    pulseTarget === "reflector" ? "jump-pulse" : ""
                ].filter(Boolean).join(" ")}
                id="how-reflector"
            >
                <article
                    className={[
                        "component-card",
                        "reflector-card",
                        "folded-card",
                        openCard === "reflector" ? "is-open" : ""
                    ].filter(Boolean).join(" ")}
                    onClick={() => setOpenCard((current) => current === "reflector" ? null : "reflector")}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setOpenCard((current) => current === "reflector" ? null : "reflector");
                        }
                    }}
                    role="button"
                    tabIndex="0"
                >
                    <h2>Reflector</h2>
                    <p className="open-card-summary">
                        Cómo devuelve la señal hacia los rotores y permite que la máquina también descifre.
                    </p>
                    {openCard !== "reflector" && (
                        <span className="folded-card-hint">Ver más sobre el reflector</span>
                    )}
                    <div className="component-copy">
                    <p>
                        El reflector es un elemento que el lector
                        puede pensar como un rotor muy simple,
                        como uno que no gira. Los únicos elementos de un reflector son su tipo y su alfabeto,
                        dependiente del tipo del mismo.
                    </p>
                    <p>
                        Un reflector también tiene una señal de entrada y otra de salida. Esto significa
                        que recibe una letra y, dependiendo del alfabeto del mismo, devolverá otra.
                    </p>
                    <p>
                        Para entenderlo bien, un reflector tiene un alfabeto como el de un rotor:
                        En lugar de ser ABCDEF... podría ser PLTHYA...,
                        en este ejemplo, si llega una A, devuelve una P, si llega una B, devuelve una L, etc.
                    </p>
                    <p>
                        La cualidad que no comparte con el rotor,
                        además de que es un elemento fijo que no tiene posiciones,
                        es que las letras están “unidas”. En el ejemplo anterior, si llega una A,
                        devuelve una P. Si llegara una P, este devolvería una A.
                        Esto no tien por qué pasar en un rotor, pero es una cualidad necesaria en el reflector.
                    </p>

                    </div>

                </article>

                <figure
                    className="component-image panel-preview"
                    onMouseEnter={() => setActiveInfo("reflector")}
                    onMouseLeave={() => setActiveInfo(null)}
                >
                    <img src={reflectorPreview} alt="Imagen de un reflector Enigma" />
                    <figcaption>Imagen representativa de un reflector de la máquina Enigma.</figcaption>
                    <aside
                        className={activeInfo === "reflector" ? "component-tab image-info-tab single-info-tab is-visible" : "component-tab image-info-tab single-info-tab"}
                        aria-hidden={activeInfo !== "reflector"}
                    >
                        <div className="component-tab-copy">
                            <h3>En nuestra máquina</h3>
                            <p>
                                La Enigma M3 de este simulador dispone de dos tipos de
                                reflector entre los que puedes alternar.
                            </p>
                            <p>
                                Otros modelos de máquina Enigma cuentan con más reflectores.
                                Puedes conocer mejor estas diferencias en la sección
                                &quot;Historia&quot;.
                            </p>
                        </div>
                    </aside>
                </figure>
            </div>

            <GuideSection
                number="03"
                id="keyboard"
                title="Teclado"
                description="El punto de entrada: cada pulsación inicia un nuevo recorrido por la máquina."
                summary="Cómo una letra pulsada se convierte en la señal que recorrerá el resto de componentes."
                paragraphs={[
                    "En anteriores elementos comentamos que, dependiendo de la versión de la máquina, podíamos tener unos tipos u otros, esto no ocurre con el teclado. Siempre es el mismo.",
                    "El teclado de la Máquina Enigma está basado en un QWERTZ. Para quien no esté familiarizado con los teclados, en la mayoría de países del mundo se usa el teclado QWERTY. Este nombre hace referencia a las 6 primeras letras del teclado. El primero mencionado es el utilizado en países con lenguas germánicas, pues la Z es una letra más común que la Y.",
                    "Se mencionó que está “basado” en un QWERTZ y no que “sea” un QWERTZ por las ligeras diferencias que este presenta. Tiene una distribución muy curiosa de las teclas. Al no haber símbolos ni números, quedarían huecos, por lo que era necesaria una distribución algo distinta a la par que cómoda y usual para los usuarios.",
                    "Desde este componente se decide qué letra va a ser la cifrada, es el comienzo de la señal que se enviará a través de los rotores, el reflector y el espacio de conexiones."
                ]}
                subsectionTitles={[
                    "UN ÚNICO TECLADO",
                    "DISTRIBUCIÓN QWERTZ",
                    "PECULIARIDADES",
                    "COMIENZO DE LA SEÑAL"
                ]}
                preview={keyboardPreview}
                previewAlt="Teclado de una máquina Enigma"
                previewCaption="Teclado representativo de una máquina Enigma."
                machineImages={[
                    {
                        src: myKeyboardPreview,
                        alt: "Teclado del simulador Enigma M3",
                        caption: "Teclado de nuestra máquina M3"
                    }
                ]}
                machineText={[
                    "Puedes pulsar las letras con el ratón para iniciar el cifrado o descifrado.",
                    "Las teclas mantienen la estética de una máquina de escribir y solo permanecen hundidas mientras las estás pulsando."
                ]}
                activeInfo={activeInfo}
                setActiveInfo={setActiveInfo}
                openCard={openCard}
                setOpenCard={setOpenCard}
                pulseTarget={pulseTarget}
            />

            <GuideSection
                number="04"
                id="plugboard"
                title="Espacio de conexiones"
                description="Una primera sustitución configurable antes y después del paso por los rotores."
                summary="Cómo los cables permiten intercambiar parejas de letras y personalizar todavía más el cifrado."
                paragraphs={[
                    "Toda máquina Enigma contiene un espacio de conexiones cercano al teclado.",
                    "Este espacio de conexiones consiste en una serie de entradas disponibles donde cada una representa una letra. Está pensado para conectar letras entre ellas.",
                    "Cuando enviamos una letra con el teclado, antes de llegar a los rotores, pasa por el espacio de conexiones, es el primer paso. Es sencillo: si, con el teclado, pulsamos la A, primero mirará en este espacio si hay una conexión con la A; si no la hay, al primer rotor le llegará una A como entrada. En caso de que, por ejemplo, exista una conexión entre la entrada A y la entrada B, al rotor le llegará una B. Esta conexión funciona en ambos sentidos, es decir, si mantenemos esa conexión A-B e introducimos una B, al primer rotor llegará una A."
                ]}
                subsectionTitles={[
                    "UBICACIÓN",
                    "ENTRADAS Y CONEXIONES",
                    "RECORRIDO DE UNA LETRA"
                ]}
                preview={plugboardPreview}
                previewAlt="Panel de conexiones de una máquina Enigma"
                previewCaption="Espacio de conexiones representativo de una máquina Enigma."
                machineImages={[
                    {
                        src: myPlugboardEmptyPreview,
                        alt: "Panel de conexiones sin cables",
                        caption: "Panel sin conexiones"
                    },
                    {
                        src: myPlugboardActivePreview,
                        alt: "Selección de letras para crear una conexión",
                        caption: "Selección y conexiones activas"
                    }
                ]}
                machineText={[
                    "En nuestra máquina puedes seleccionar dos letras para unirlas. Las parejas activas aparecen identificadas en el propio panel.",
                    "El modo para daltónicos añade números romanos para reconocer cada pareja sin depender únicamente del color."
                ]}
                activeInfo={activeInfo}
                setActiveInfo={setActiveInfo}
                openCard={openCard}
                setOpenCard={setOpenCard}
                pulseTarget={pulseTarget}
            />

            <GuideSection
                number="05"
                id="output"
                title="Salida"
                description="La letra resultante se muestra después de completar todo el recorrido eléctrico."
                summary="Cómo la máquina comunica el resultado final del cifrado o descifrado."
                paragraphs={[
                    "Las máquinas Enigma originales utilizaban un panel de bombillas. Tras completar el recorrido, se iluminaba la bombilla correspondiente a la letra obtenida.",
                    "La letra iluminada es el resultado final. Para formar un mensaje completo, el operador debía anotar cada salida y repetir el proceso letra por letra.",
                    "Como el recorrido es reversible cuando la configuración coincide, la salida cifrada puede introducirse de nuevo para recuperar el texto original."
                ]}
                subsectionTitles={[
                    "PANEL DE BOMBILLAS",
                    "RESULTADO FINAL",
                    "RECORRIDO REVERSIBLE"
                ]}
                preview={lampsPreview}
                previewAlt="Panel de bombillas de una máquina Enigma"
                previewCaption="Panel de salida con bombillas de una máquina Enigma."
                machineImages={[
                    {
                        src: myOutputPreview,
                        alt: "Salida de letra del simulador",
                        caption: "Salida de nuestra máquina M3"
                    }
                ]}
                machineText={[
                    "En el simulador, la letra resultante aparece en la gran hoja situada debajo de los rotores.",
                    "El historial de sesión permite consultar las transformaciones realizadas durante el uso de la máquina."
                ]}
                activeInfo={activeInfo}
                setActiveInfo={setActiveInfo}
                openCard={openCard}
                setOpenCard={setOpenCard}
                pulseTarget={pulseTarget}
            />

            <header className="component-section-heading">
                <span>06</span>
                <div>
                    <h2>Flujo completo</h2>
                    <p>El recorrido entero que sigue una letra desde que se pulsa hasta que aparece transformada.</p>
                </div>
            </header>

            <section
                className={pulseTarget === "flow" ? "full-flow jump-pulse" : "full-flow"}
                id="how-flow"
                aria-label="Flujo completo de una letra"
            >
                {["Teclado", "Conexiones", "Rotores", "Reflector", "Rotores", "Conexiones", "Salida"].map((step, index) => (
                    <div className="flow-step" key={`${step}-${index}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <strong>{step}</strong>
                    </div>
                ))}
            </section>
        </section>
    );
}

function HistoryPage() {
    const [pulseTarget, setPulseTarget] = useState("");

    const jumpToHistorySection = (target) => {
        setPulseTarget("");
        requestAnimationFrame(() => {
            document.getElementById(`history-${target}`)?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            setPulseTarget(target);
            window.setTimeout(() => setPulseTarget(""), 900);
        });
    };

    const historySections = [
        {id: "context", label: "Contexto histórico"},
        {id: "machine", label: "¿Qué es Enigma?"},
        {id: "deciphering", label: "Descifrado"},
        {id: "timeline", label: "Línea temporal"},
        {id: "curiosities", label: "Curiosidades"}
    ];

    return (
        <section className="history-page" aria-label="Historia de la máquina Enigma">
            <section className="intro-panel history-intro" aria-label="Introducción histórica">
                <div>
                    <p className="eyebrow">Archivo histórico</p>
                    <h1>Historia</h1>
                    <p>
                        Un recorrido por el origen, la evolución y el descifrado de la máquina Enigma.
                    </p>
                </div>
                <div className="intro-notes history-jump-buttons">
                    {historySections.map((section) => (
                        <button
                            type="button"
                            key={section.id}
                            onClick={() => jumpToHistorySection(section.id)}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>
            </section>

            <section
                className={pulseTarget === "context" ? "history-section jump-pulse" : "history-section"}
                id="history-context"
            >
                <header className="history-section-heading">
                    <span>01</span>
                    <div>
                        <p>Los acontecimientos que prepararon el terreno</p>
                        <h2>Contexto histórico</h2>
                    </div>
                </header>
                <div className="history-context-grid">
                        <article className="history-note">
                            <h3>Historia</h3>
                            <p>
                                La <strong>Máquina Enigma</strong> fue la máquina utilizada por las <strong>Potencias del Eje</strong> en la Segunda Guerra Mundial para cifrar sus comunicaciones de una manera segura.
                                Para entender la Máquina Enigma y sus orígenes tenemos que remontarnos al comienzo del siglo XX, antes de que el partido nazi alcanzara el poder.
                            </p>
                            <p>
                                <strong>Arthur Scherbius</strong>, nacido en <strong>1878</strong> en <strong>Fráncfort del Meno</strong> y graduado en ingeniería eléctrica tanto en la Universidad Técnica de Munich como en la Universidad de Hannover,
                                decide fundar una empresa bajo el nombre de Scherbius & Ritter. De esta forma, hizo múltiples inventos, entre los que estaba cierta máquina basada en ruedas cableadas giratorias,
                                hoy día conocida como máquina de rotores.
                                Los modelos creados se apodaban con letras. El primero fue el modelo A, el segundo el B y el tercero y último que creó, el modelo C. La máquina Enigma utilizada durante la guerra era del tamaño de una máquina de escribir y, de hecho, se parecía mucho en cuestiones
                                como el teclado o la forma general de la máquina. Estos primeros modelos se asemejaban más a una máquina registradora.
                            </p>
                            <p>
                                En <strong>1918</strong>, Arthur patenta su máquina, pensada originalmente para actuar como cifradora para empresas importantes como bancos.
                                En estos años nos enfrentamos a una situación de gran inestabilidad política y social. Es el nacimiento de la República de Weimar, el fin de la Gran Guerra.
                                Ante esta situación, Scherbius dudaba de si realmente la patente de la máquina llegaría a dar frutos, la realidad era que nadie parecía mostrar interés ante esta máquina.
                                Esto, si bien es correcto cuando hablamos del ciudadano promedio, no es de igual forma para el gobierno. El gobierno alemán estaba altamente interesado en una máquina codificadora
                                plenamente funcional e indescifrable, pues un año antes, en <strong>1917</strong>, se interceptó y decodificó el <strong>Telegrama de Zimmermann</strong>, lo que puso a Estados Unidos en el mapa y cambió el transcurso de la batalla.
                            </p>
                            <p>
                                En <strong>1926</strong>, ya comercializada bajo el nombre "Enigma", fue adoptada por la Armada alemana y, unos años más tarde, en <strong>1934</strong>, la versión M3 de la máquina fue adoptada por la armada naval.
                                Para este entonces, Arthur Scherbius ya no estaba presente para ver el alcance de su invención, falleció en <strong>1929</strong> sin conocer la importancia que tuvo la existencia de su invento
                                en una guerra que tampoco alcanzó a vislumbrar.
                            </p>
                            <p>
                                En <strong>1939</strong>, a punto de empezar la guerra, se crea la máquina enigma M4, que será la que usarán los aliados de Alemania durante toda la guerra, hasta que Alan Turing y su equipo logren descifrarla.
                            </p>
                        </article>
                </div>
            </section>

            <section
                className={pulseTarget === "machine" ? "history-section jump-pulse" : "history-section"}
                id="history-machine"
            >
                <header className="history-section-heading">
                    <span>02</span>
                    <div>
                        <p>Una introducción a su funcionamiento y propósito</p>
                        <h2>¿Qué es la máquina Enigma?</h2>
                    </div>
                </header>
                <article className="history-paper">
                    <h3>Orígenes de la criptografía</h3>
                    <p>
                        La respuesta simple es que la máquina Enigma es una máquina de cifrado por rotores, pero esa no
                        sería una buena respuesta.
                        Para poder responder adecuadamente a esta pregunta tenemos que preguntarnos "¿Qué es el
                        cifrado?"
                    </p>
                    <p>
                        Nos referimos a cifrar cuando hablamos del proceso de codificación de la información. Codificar
                        la información, en palabras simples,
                        es convertir el mensaje que queremos transmitir en otro. Este segundo mensaje puede tener
                        sentido o puede que no lo tenga, lo normal es que no lo tenga.
                        A la ciencia que estudia el cifrado de mensajes se le llama Criptografía. Si queremos hablar de
                        esta ciencia, nos remontaremos al siglo V aC, nos remontamos a la guerra del Peloponeso.
                    </p>
                    <p>
                        La criptografía se cree que nace en la guerra de Esparta y Atenas. La comunicación entre los
                        distintos
                        aliados de un bando siempre fue algo de suma importancia en una contienda bélica y fue entonces
                        cuando
                        pensaron que la guerra podría dar una vuelta si, el mensaje, aunque fuera interceptado, solo lo
                        pudieran
                        entender ellos. Esto fue clave en el avance de la guerra por parte del bando griego, pues
                        lograron
                        crear el primer método registrado de cifrado.
                    </p>
                    <h4>
                        La escítala
                    </h4>
                    <p>
                        Los griegos usaban la llamada "Escítala", que constaba de un palo, rodillo o escalta que
                        rodeaban de
                        una tira de papel, ambos elementos de un tamaño adecuado y preciso. Existe un debate en la
                        comunidad que menciona
                        si este método de cifrado verdaderamente fue fruto de esta sociedad o si ya existía en otras
                        polis. Como no es claro,
                        lo trataremos como si hubiese surgido en la mencionada.
                    </p>
                    <p>
                        La escítala era un método sencillo, no requería de memorización
                        ni de algoritmos complejos. Si tenías 2 varas del mismo tamaño, tenías el mensaje.

                        Usualmente se escogían varas hexagonales u octogonales por sus caras planas. Alrededor, se
                        enrollaba
                        la tira de papel y se escribía sobre ella, una línea en cada cara de la vara. Cuando
                        desenrollabas la cinta,
                        tenías una tira de papel con letras aparentemente aleatorias en ella. Así, solo quien tuviera
                        una escalta del mismo tamaño podía descifrar el mensaje, volviendo a enrollar la tira sobre la
                        misma.
                    </p>
                    <p>
                        Si nos fijamos en el contexto histórico que este tenía detrás, podemos decir que no acababa de
                        ser
                        el mejor método de cifrado. En esta época todavía no existían los métodos de puntuación y no se
                        utilizaban
                        espacios para separar las palabras. Por si fuera poco, todas las palabras se escribían en
                        mayúscula,
                        por lo que era responsabilidad del lector identificar dónde empezaban y terminaban las palabras.
                        Todo
                        esto dificultaba la lectura del mensaje, aún siendo descifrado.

                        Aristóteles decía que este método, además, era fácilmente descifrable: si alguien probaba con
                        distintos
                        grosores de vara y distintas formas, no había tantas posibilidades. De todas formas, esto
                        requería tiempo
                        y todos sabemos que, en la guerra, cada segundo cuenta.
                    </p>

                    <h4>
                        Cifrado César
                    </h4>
                    <p>
                        Cuanto más avanzamos en el tiempo, más tipos de cifrado nos podemos encontrar. El cifrado César
                        fue el ideado por los romanos en el siglo I aC. Este era, de igual forma que el anterior,
                        simple.
                        Pero no requería de ningún artilugio, solo hacía falta conocer un número.
                    </p>
                    <p>
                        El cifrado César consistía en coger el alfabeto y moverlo 3 letras a la derecha. Así, la A se
                        convertía en la D, la B en la E, la C en la F y así progresivamente hasta volver a la A. Esto
                        ocasiona mensajes aparentemente sin sentido, pero sigue manteniendo los patrones del habla.
                        Si una palabra es corta, véase artículos como "el" o "la" en castellano, seguirán siendo así.
                        Como son palabras muy comunes, es sencillo asociar palabras, esto asociará letras y poco a poco
                        nos dará el alfabeto entero. También, si una letra es muy común en el lenguaje, lo será su letra
                        asociada bajo este cifrado.
                    </p>
                    <p>
                        El número que se dijo que hacía falta conocer era el desplazamiento. Se mencionó que se movían
                        las
                        letras 3 posiciones a la derecha, pero esto fue variando con el paso del tiempo.
                    </p>
                    <h4>
                        La máquina Enigma
                    </h4>
                    <p>
                        Ahora que hablamos de distintas formas de cifrado, podemos pasar a entender mejor qué hace la
                        máquina Enigma
                        y cómo funciona.
                    </p>
                    <p>
                        En el cifrado César, se formaba un nuevo abecedario. Podemos pensarlo como que se hacía una
                        asociación 1 a 1 con las letras de ambos. Así, teníamos ABCDEF... y DEFGHI... Donde la primera
                        letra
                        del primer abecedario se sustituía con la primera del segundo, la segunda letra con la segunda y
                        así
                        hasta terminar el abecedario. Esta es la base de la máquina Enigma.
                    </p>
                    <p>
                        Una vez entendido lo anterior, podemos pasar a responder la pregunta "¿Qué es la máquina
                        Enigma?".
                        La máquina Enigma es una máquina de cifrado por rotores. Un rotor es, en resumidas cuentas, una
                        pieza que rota.
                        Se explicó el funcionamiento de esta pieza en la sección "¿Cómo funciona?". Lo importante ahora
                        es
                        entender que cada rotor tiene un abecedario nuevo, como si tuviéramos un pequeño cifrado César
                        metido
                        en cada pieza. Este abecedario no sigue un patrón como los anteriores, no son 3 posiciones a la
                        derecha,
                        sino que es una selección sin patrón del orden de las letras. De igual forma, se hace una
                        asociación
                        1 a 1 para las letras.
                    </p>
                    <p>
                        Hablar de la "máquina Enigma" como entidad universal es un error de concepto. Hay múltiples
                        versiones
                        de la misma, por ende, hay múltiples máquinas Enigma. El simulador montado en esta página es la
                        versión M3, que es la primera versión modificada por la armada. Esta, como nuevas adiciones,
                        incluía los tipos IV y V de rotores y los tipos B y C del reflector
                    </p>
                    <p>
                        Más tarde en la guerra, en 1942 se creó la versión M4 de la máquina, que incluía nuevos tipos de rotores,
                        nuevos reflectores y un rotor adicional. Ahora, en vez de 3 rotores simultáneamente, tenía 4. Este rotor
                        extra le daba una complejidad extra a la decodificación de los británicos de unas 50 a 100 veces, es esta
                        la razón dentrás de la adición del nuevo rotor. De todas formas, un error en el cifrado hizo que
                        el descubrimiento del funcionamiento de este nuevo rotor fuera posible, por lo que, realmente,
                        no tuvo el efecto deseado.
                    </p>
                </article>
            </section>

            <section
                className={pulseTarget === "deciphering" ? "history-section jump-pulse" : "history-section"}
                id="history-deciphering"
            >
                <header className="history-section-heading">
                    <span>03</span>
                    <div>
                        <p>Las personas y métodos que permitieron comprender sus mensajes</p>
                        <h2>Descifrado</h2>
                    </div>
                </header>
                <article className="history-paper history-paper-wide">
                    <h3>El reto de descifrar Enigma</h3>
                    <p>
                        Tener una Máquina Enigma no era suficiente para poder leer los mensajes del bando alemán. Para
                        cifrar y descifrar un mensaje era necesario que ambas máquinas estuvieran configuradas
                        exactamente de la misma forma. Los operadores alemanes utilizaban libros de claves donde
                        aparecían los ajustes correspondientes a cada día del mes, como los rotores que debían utilizar
                        y sus posiciones iniciales. Esta configuración cambiaba diariamente, por lo que descubrir la
                        clave de un día no solucionaba el problema para siempre: al día siguiente, el trabajo comenzaba
                        de nuevo.
                    </p>
                    <p>
                        Estos libros eran, por tanto, información de enorme valor. La captura de material alemán, como
                        máquinas, manuales o libros de códigos, permitió conocer mejor el funcionamiento de sus redes de
                        comunicación y facilitó el trabajo de los equipos de descifrado. Aun así, seguía siendo
                        necesario encontrar la configuración concreta utilizada en cada jornada entre una cantidad
                        inmensa de posibilidades.
                    </p>

                    <h4>Bletchley Park</h4>
                    <p>
                        El principal centro británico dedicado al descifrado se encontraba en <strong>Bletchley
                        Park</strong>, una propiedad situada al norte de Londres que durante la guerra pasó a ser
                        conocida también como la <strong>Estación X</strong>. Allí se reunieron matemáticos,
                        criptógrafos, lingüistas, ingenieros, jugadores de ajedrez, personas aficionadas a los
                        crucigramas y muchos otros perfiles que podían aportar una manera distinta de enfrentarse al
                        problema.
                    </p>
                    <p>
                        El descifrado de Enigma no consistía únicamente en observar una máquina y descubrir su
                        funcionamiento. Primero se interceptaban los mensajes enviados por radio, después se buscaban
                        posibles fragmentos del texto original y, finalmente, se probaban y descartaban configuraciones
                        hasta encontrar una que tuviera sentido. Todo este proceso se realizaba bajo un secreto
                        absoluto y de forma continua, mediante distintos turnos de trabajo.
                    </p>

                    <h4>Alan Turing y un mérito compartido</h4>
                    <p>
                        Cuando se habla del descifrado de Enigma, el nombre que más se repite es el de <strong>Alan
                        Turing</strong>. Su mérito es indiscutible: fue una figura fundamental en Bletchley Park y
                        participó en el diseño de la <strong>Bombe</strong>, una máquina electromecánica que permitía
                        descartar rápidamente configuraciones incompatibles con un mensaje y reducir el número de
                        posibilidades que debían comprobarse manualmente.
                    </p>
                    <p>
                        Sin embargo, presentar esta historia como el logro de una sola persona sería injusto. La Bombe
                        británica partía del trabajo previo de los criptógrafos polacos, entre los que destacó <strong>Marian Rejewski</strong>.
                        En su desarrollo también fueron esenciales las mejoras de <strong>Gordon Welchman</strong> y
                        el trabajo de ingeniería de <strong>Harold Keen</strong>.
                        Junto a ellos participaron miles de personas encargadas de interceptar, organizar, estudiar y
                        comprobar mensajes. Alan Turing merece ser recordado, pero también lo merece el equipo que hizo
                        posible convertir sus ideas en resultados diarios.
                    </p>

                    <h4>Las descodificadoras invisibles</h4>
                    <p>
                        Las mujeres formaban aproximadamente tres cuartas partes del personal de Bletchley Park, aunque
                        durante décadas su participación quedó oculta tras una historia contada principalmente a través
                        de figuras masculinas. No se limitaron a realizar tareas auxiliares: operaron máquinas,
                        analizaron mensajes y formaron parte directa de los equipos de criptografía.
                    </p>
                    <p>
                        <strong>Joan Clarke</strong> trabajó en el equipo de Alan Turing y llegó a ser subdirectora de
                        la cabaña 8, dedicada a los mensajes de la armada alemana. <strong>Mavis Lever</strong> y <strong>Margaret Rock</strong> formaron
                        parte del equipo dirigido por Dilly Knox y ayudaron a
                        romper el código utilizado por el servicio de inteligencia alemán. Estos nombres representan a
                        muchas otras mujeres cuyo trabajo permaneció en secreto y que también fueron responsables del
                        éxito de Bletchley Park.
                    </p>

                    <h4>Descifrando Enigma</h4>
                    <p>
                        En <strong>2014</strong> se estrenó <em>The Imitation Game</em>, conocida en España como
                        <em>Descifrando Enigma</em>. La película fue dirigida por Morten Tyldum, está basada en la
                        biografía de Alan Turing escrita por Andrew Hodges y cuenta con Benedict Cumberbatch en el papel
                        protagonista. Su estreno ayudó a que una gran cantidad de personas conocieran la historia de
                        Turing y el trabajo realizado en Bletchley Park.
                    </p>
                    <p>
                        De todas formas, debe entenderse como una dramatización y no como un documental. La película
                        modifica o simplifica ciertos acontecimientos y concentra gran parte del relato en la figura de
                        Turing. Es una buena puerta de entrada a esta historia, pero el descifrado real de Enigma fue un
                        esfuerzo colectivo mucho más amplio, construido sobre el trabajo de polacos, británicos,
                        hombres y mujeres cuyos nombres no siempre aparecen en pantalla.
                    </p>
                </article>
            </section>

            <section
                className={pulseTarget === "timeline" ? "history-section jump-pulse" : "history-section"}
                id="history-timeline"
            >
                <header className="history-section-heading">
                    <span>04</span>
                    <div>
                        <p>Los momentos más importantes de su historia</p>
                        <h2>Línea temporal de la máquina Enigma</h2>
                    </div>
                </header>
                <div className="history-timeline">
                    {[
                        {
                            date: "1918",
                            title: "Creación de Enigma",
                            text: "Arthur Scherbius patenta una máquina de cifrado por rotores que terminará siendo conocida como Máquina Enigma."
                        },
                        {
                            date: "1934",
                            title: "Adopción por la armada",
                            text: "La versión M3 de la Máquina Enigma es adoptada por la armada alemana para proteger sus comunicaciones."
                        },
                        {
                            date: "1939",
                            title: "Comienza la guerra",
                            text: "El comienzo de la Segunda Guerra Mundial convierte las comunicaciones cifradas con Enigma en un elemento fundamental."
                        },
                        {
                            date: "1939",
                            title: "Bletchley Park",
                            text: "El equipo británico de descifrado se instala en Bletchley Park, que se convierte en el principal centro aliado de criptografía."
                        },
                        {
                            date: "1945",
                            title: "Final de la guerra",
                            text: "Termina la Segunda Guerra Mundial. El trabajo realizado para descifrar las comunicaciones de Enigma permanece en secreto durante años."
                        }
                    ].map((event) => (
                        <article className="timeline-event" key={`${event.date}-${event.title}`}>
                            <span>{event.date}</span>
                            <h3>{event.title}</h3>
                            <p>{event.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section
                className={pulseTarget === "curiosities" ? "history-section jump-pulse" : "history-section"}
                id="history-curiosities"
            >
                <header className="history-section-heading">
                    <span>05</span>
                    <div>
                        <p>Detalles, anécdotas y datos menos conocidos</p>
                        <h2>Curiosidades</h2>
                    </div>
                </header>
                <div className="curiosity-grid">
                    {[
                        {
                            title: "Enigma fuera de Alemania",
                            text: "Aunque suele relacionarse únicamente con Alemania, otros países también utilizaron máquinas Enigma. Durante la Guerra Civil española se emplearon modelos comerciales en el bando sublevado y algunas de estas máquinas todavía se conservan en museos españoles. La Marina italiana también utilizó una variante comercial, conocida como Navy Cipher D, y posteriormente otros modelos de Enigma para proteger parte de sus comunicaciones."
                        },
                        {
                            title: "Parecida a una máquina de escribir",
                            text: "Su teclado, su tamaño y la caja utilizada para transportarla hacían que la Máquina Enigma recordase a una máquina de escribir. Este aspecto familiar facilitaba su uso y permitía que fuese transportada y utilizada de una forma relativamente discreta, sin parecer a primera vista una compleja herramienta criptográfica."
                        },
                        {
                            title: "El significado de M3",
                            text: "El nombre M3 identifica la versión naval de tres rotores de la Máquina Enigma. La letra M hace referencia a Marine, marina en alemán, mientras que el número 3 permite distinguirla como el modelo que utilizaba tres rotores simultáneamente. Más tarde apareció la M4, preparada para trabajar con un cuarto rotor."
                        },
                        {
                            title: "Bletchley Park y el primer ordenador",
                            text: "En Bletchley Park no solo se trabajó con la Bombe utilizada contra Enigma. Allí también se instaló Colossus, considerado el primer ordenador digital electrónico programable. Colossus no descifraba mensajes de Enigma, sino los producidos por el sistema Lorenz, utilizado para comunicaciones alemanas de alto nivel."
                        }
                    ].map((curiosity, index) => (
                        <article key={curiosity.title}>
                            <span>{String(index + 1).padStart(2, "0")}</span>
                            <h3>{curiosity.title}</h3>
                            <p>{curiosity.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </section>
    );
}

function CodeBookPage() {
    const columns = [
        {
            title: "Tag",
            text: "Indica el día del mes para el que deben utilizarse los ajustes de esa fila."
        },
        {
            title: "Walzenlage",
            text: "Muestra el orden de los rotores que deben colocarse en la máquina."
        },
        {
            title: "Ringstellung",
            text: "Define la posición inicial del anillo de cada uno de los tres rotores."
        },
        {
            title: "Steckerverbindungen",
            text: "Enumera las parejas de letras que deben unirse mediante cables en el espacio de conexiones."
        },
        {
            title: "Kenngruppen",
            text: "Son grupos indicadores de tres letras utilizados para identificar la clave o el procedimiento aplicado al mensaje."
        }
    ];

    return (
        <section className="reference-page" aria-label="Libro de codificación">
            <section className="intro-panel reference-intro">
                <div>
                    <p className="eyebrow">Documento secreto</p>
                    <h1>Libro de codificación</h1>
                    <p>
                        Los operadores consultaban estos libros para configurar sus máquinas de la misma forma
                        antes de intercambiar mensajes.
                    </p>
                </div>
                <aside className="reference-stamp">
                    <strong>GEHEIM!</strong>
                    <span>Solo para uso autorizado</span>
                </aside>
            </section>

            <section className="codebook-layout">
                <figure className="codebook-document">
                    <img src={codeBookPreview} alt="Página de un libro de claves de la Máquina Enigma" />
                    <figcaption>Hoja mensual de claves de diciembre de 1940.</figcaption>
                </figure>
                <article className="codebook-explanation">
                    <p className="eyebrow">Cómo utilizarlo</p>
                    <h2>Una configuración para cada día</h2>
                    <p>
                        Para cifrar o descifrar correctamente, emisor y receptor debían utilizar la fila
                        correspondiente al mismo día. Al cambiar la fecha, también cambiaban los ajustes.
                    </p>
                    <p>
                        El libro debía mantenerse en secreto: conocer el funcionamiento de Enigma no servía de
                        mucho sin conocer también la clave diaria.
                    </p>
                    <p>
                        Todos los días se utilizaba el Reflector tipo C
                    </p>
                </article>
            </section>

            <section className="codebook-columns" aria-label="Columnas del libro de codificación">
                {columns.map((column, index) => (
                    <article key={column.title}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <h3>{column.title}</h3>
                        <p>{column.text}</p>
                    </article>
                ))}
            </section>
        </section>
    );
}

function ChallengesPage({onOpenMachine}) {
    const [visibleHint, setVisibleHint] = useState(null);
    const missions = [
        {
            date: "7 de diciembre de 1940",
            message: "IXSPB NIVXQ WNSTF HGDHV UNDOF ALS",
            hint: "Pensaba que estaban extintos..."
        },
        {
            date: "11 de diciembre de 1940",
            message: "ZIJME WKYAZ CUSUP CURDC RPUBO LPDEY AEHTB AG",
            hint: "Parece que nos necesitan"
        },
        {
            date: "24 de diciembre de 1940",
            message: "GFCQA RMQVA QVGPN JRIMX INOUE KXYYY ONXSF JUBEY HKWG",
            hint: "Alguien se equivocó y lo va a pagar muy caro"
        },
        {
            date: "31 de diciembre de 1940",
            message: "IEXLU SQRAR YVVZZ CANHY ODRJM UOWKX SKACN X",
            hint: "¿Eren Yeager? No lo conozco, pero le buscan"
        }
    ];

    return (
        <section className="missions-page" aria-label="Retos de descifrado">
            <section className="intro-panel missions-intro">
                <div>
                    <p className="eyebrow">Bletchley Park · Estación X</p>
                    <h1>Retos</h1>
                    <p>
                        Hemos interceptado varios mensajes de un remitente desconocido, aunque parece que te conoce... Utiliza los ajustes recuperados del libro
                        de codificación y descubre qué dicen, si juntas las 3 primeras letras de cada mensaje decodificado, obtendrás el mensaje secreto.
                    </p>
                </div>
                <button type="button" className="mission-machine-button" onClick={onOpenMachine}>
                    Abrir Máquina Enigma
                </button>
            </section>

            <section className="mission-briefing">
                <strong>Misión</strong>
                <p>
                    Configura los rotores, sus posiciones iniciales y las conexiones indicadas. Selecciona el
                    modo descifrar e introduce cada mensaje letra por letra, ignorando los espacios. Para confirmar que
                    estás haciendo un buen trabajo, hay una pista asociada a cada mensaje.
                </p>
            </section>

            <div className="mission-grid">
                {missions.map((mission, index) => (
                    <article className="mission-card" key={`${mission.date}-${index}`}>
                        <header>
                            <span>Mensaje {String(index + 1).padStart(2, "0")}</span>
                            <strong>{mission.date}</strong>
                        </header>
                        <code>{mission.message}</code>
                        {visibleHint === index && (
                            <p className="mission-hint">{mission.hint}</p>
                        )}
                        <div className="mission-actions">
                            <button
                                type="button"
                                onClick={() => setVisibleHint((current) => current === index ? null : index)}
                            >
                                {visibleHint === index ? "Ocultar pista" : "Mostrar pista"}
                            </button>
                            <button type="button" onClick={onOpenMachine}>Resolver en la máquina</button>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const {accessToken, logout} = useAuth();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [plugboardOpen, setPlugboardOpen] = useState(false);
    const [machine, setMachine] = useState(emptyMachine);
    const [selectedPlug, setSelectedPlug] = useState(null);
    const [lastOutput, setLastOutput] = useState("");
    const [sessionHistory, setSessionHistory] = useState([]);
    const [allTimeHistory, setAllTimeHistory] = useState([]);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [accessibilityOpen, setAccessibilityOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [stepsOpen, setStepsOpen] = useState(false);
    const [lastSteps, setLastSteps] = useState([]);
    const [status, setStatus] = useState("Lista para usar");
    const [machineMode, setMachineMode] = useState("cifrar");
    const [activePage, setActivePage] = useState("machine");
    const [pulseTarget, setPulseTarget] = useState("");
    const [lightMode, setLightMode] = useState(
        () => localStorage.getItem("enigma-accessibility-light") === "true"
    );
    const [colorblindMode, setColorblindMode] = useState(
        () => localStorage.getItem("enigma-accessibility-colorblind") === "true"
    );
    const [fontScale, setFontScale] = useState(() => {
        const savedScale = Number(localStorage.getItem("enigma-accessibility-font-scale"));
        return savedScale >= FONT_SCALE_MIN && savedScale <= FONT_SCALE_MAX ? savedScale : 100;
    });
    const skipNextHistorySave = useRef(false);
    const userAreaRef = useRef(null);
    const historyPanelRef = useRef(null);
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
            const color = getCableColor(index, colorblindMode);
            const identifier = ROMAN_NUMERALS[index] || String(index + 1);
            letters.set(cable.a, { cable, color, identifier });
            letters.set(cable.b, { cable, color, identifier });
        });
        return letters;
    }, [cablePairs, colorblindMode]);

    const latestSteps = useMemo(() => {
        return lastSteps.length ? lastSteps : normaliseSteps(sessionHistory[0]?.steps);
    }, [lastSteps, sessionHistory]);

    const chronologicalSessionHistory = useMemo(() => {
        return [...sessionHistory].reverse();
    }, [sessionHistory]);

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
        setAccessibilityOpen(false);
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

    useEffect(() => {
        if (!accountMenuOpen && !accessibilityOpen && !historyOpen) {
            return undefined;
        }

        const closeOpenPanels = (event) => {
            if (
                (accountMenuOpen || accessibilityOpen) &&
                !userAreaRef.current?.contains(event.target)
            ) {
                setAccountMenuOpen(false);
                setAccessibilityOpen(false);
            }

            if (historyOpen && !historyPanelRef.current?.contains(event.target)) {
                setHistoryOpen(false);
            }
        };

        document.addEventListener("pointerdown", closeOpenPanels);
        return () => document.removeEventListener("pointerdown", closeOpenPanels);
    }, [accountMenuOpen, accessibilityOpen, historyOpen]);

    useEffect(() => {
        localStorage.setItem("enigma-accessibility-light", String(lightMode));
        localStorage.setItem("enigma-accessibility-colorblind", String(colorblindMode));
        localStorage.setItem("enigma-accessibility-font-scale", String(fontScale));
        document.documentElement.style.fontSize = `${fontScale}%`;
    }, [lightMode, colorblindMode, fontScale]);

    const changeFontScale = (difference) => {
        setFontScale((current) =>
            Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, current + difference))
        );
    };

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

    const clearCurrentMessage = () => {
        setSessionHistory([]);
        setLastOutput("");
        setLastSteps([]);
        setStepsOpen(false);
        setStatus("Mensaje limpiado");
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
                reflector: current.reflector === 0 ? 1 : 0
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
        <main
            className={[
                "enigma-page",
                lightMode ? "light-mode" : "",
                colorblindMode ? "colorblind-mode" : ""
            ].filter(Boolean).join(" ")}
        >
            <header className="topbar">
                <nav className="main-tabs" aria-label="Navegacion principal">
                    <button type="button" onClick={() => setActivePage("machine")}>
                        Máquina Enigma
                    </button>
                    <button type="button" onClick={() => setActivePage("how")}>
                        ¿Cómo funciona?
                    </button>
                    <button type="button" onClick={() => setActivePage("history")}>Historia</button>
                    <button type="button" onClick={() => setActivePage("codebook")}>
                        Libro de codificación
                    </button>
                    <button type="button" onClick={() => setActivePage("challenges")}>Retos</button>
                </nav>

                <div className="title-strip">MAQUINA ENIGMA M3</div>

                <div className="user-area" ref={userAreaRef}>
                    <div className="auth-row">
                        {accessToken ? (
                            <>
                                <span className="session-dot" aria-label="Sesion iniciada" />
                                <button
                                    className="account-button"
                                    onClick={() => {
                                        setAccountMenuOpen((open) => !open);
                                        setAccessibilityOpen(false);
                                    }}
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
                    <button
                        className="accessibility-button"
                        type="button"
                        aria-label="Accesibilidad"
                        aria-expanded={accessibilityOpen}
                        onClick={() => {
                            setAccessibilityOpen((open) => !open);
                            setAccountMenuOpen(false);
                        }}
                    >
                        <img src={accessibilityIcon} alt="" aria-hidden="true" />
                    </button>
                    {accessibilityOpen && (
                        <div className="accessibility-menu">
                            <button
                                type="button"
                                aria-pressed={lightMode}
                                onClick={() => setLightMode((active) => !active)}
                            >
                                <span>Modo claro</span>
                                <strong>{lightMode ? "Activado" : "Desactivado"}</strong>
                            </button>
                            <button
                                type="button"
                                aria-pressed={colorblindMode}
                                onClick={() => setColorblindMode((active) => !active)}
                            >
                                <span>Colores accesibles</span>
                                <strong>{colorblindMode ? "Activado" : "Desactivado"}</strong>
                            </button>
                            <div className="font-controls">
                                <span>Tamano de letra</span>
                                <div>
                                    <button
                                        type="button"
                                        aria-label="Disminuir tamano de letra"
                                        disabled={fontScale === FONT_SCALE_MIN}
                                        onClick={() => changeFontScale(-FONT_SCALE_STEP)}
                                    >
                                        A-
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Restablecer tamano de letra"
                                        onClick={() => setFontScale(100)}
                                    >
                                        {fontScale}%
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Aumentar tamano de letra"
                                        disabled={fontScale === FONT_SCALE_MAX}
                                        onClick={() => changeFontScale(FONT_SCALE_STEP)}
                                    >
                                        A+
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {activePage === "how" ? (
                <HowWorksPage />
            ) : activePage === "history" ? (
                <HistoryPage />
            ) : activePage === "codebook" ? (
                <CodeBookPage />
            ) : activePage === "challenges" ? (
                <ChallengesPage onOpenMachine={() => setActivePage("machine")} />
            ) : (
                <>
            <section className="intro-panel machine-intro" aria-label="Introduccion">
                <div className="intro-heading">
                    <p className="eyebrow">Simulador interactivo</p>
                    <h1>Enigma M3</h1>
                </div>
                <div className="intro-copy">
                    <p>
                        Una máquina de cifrado por rotores donde cada letra atraviesa el
                        teclado, el panel de conexiones, los rotores y el reflector antes de
                        volver transformada.
                    </p>
                    <p>
                        Antes de clicar nada. Puedes modificar los ajustes de la máquina en el botón
                        "Rotores". Está especificado qué significan estos ajustes en la sección
                        "¿Cómo funciona?". También tienes un botón de accesibilidad arriba a la derecha de la pantalla
                        en caso de querer realizar cambios sobre la página.
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
                        <button onClick={changeReflector}>
                            Reflector {reflectorNames[machine.reflector] ?? machine.reflector}
                        </button>
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
                                <img className="rotor-wheel" src={rotorWheel} alt="" />
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
                                        <span>{letter}</span>
                                        {colorblindMode && connectedLetters.has(index) && (
                                            <small className="cable-identifier" aria-hidden="true">
                                                {connectedLetters.get(index).identifier}
                                            </small>
                                        )}
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
                                                style={{
                                                    "--cable-color": getCableColor(index, colorblindMode)
                                                }}
                                                title="Quitar cable"
                                            >
                                                {letters.a}-{letters.b}
                                                {colorblindMode && (
                                                    <small className="cable-identifier" aria-hidden="true">
                                                        {ROMAN_NUMERALS[index] || index + 1}
                                                    </small>
                                                )}
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
                        {chronologicalSessionHistory.map((item, index) => (
                            <span key={`input-${index}`}>{item.input}</span>
                        ))}
                    </div>
                    <div>
                        <h2>Salida</h2>
                        {chronologicalSessionHistory.map((item, index) => (
                            <span key={`output-${index}`}>{item.output}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="steps-area" aria-label="Pasos de cifrado">
                <div className="steps-actions">
                    <button
                        className="steps-toggle"
                        onClick={() => setStepsOpen((open) => !open)}
                        disabled={!latestSteps.length}
                    >
                        {stepsOpen ? "Ocultar pasos seguidos" : "Mostrar pasos seguidos"}
                    </button>
                    <button
                        className="steps-clear"
                        type="button"
                        onClick={clearCurrentMessage}
                        disabled={!sessionHistory.length && !lastOutput && !lastSteps.length}
                    >
                        Limpiar
                    </button>
                </div>

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
                <section
                    className="history-panel"
                    aria-label="Historial completo"
                    ref={historyPanelRef}
                >
                    <div className="history-panel-header">
                        <h2>Historial</h2>
                        <button onClick={() => setHistoryOpen(false)}>Cerrar</button>
                    </div>
                    <div className="history-columns">
                        <div>
                            <h3>Sesion</h3>
                            <div className="history-list">
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
                        </div>
                        <div>
                            <h3>Todos</h3>
                            <div className="history-list">
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
                    </div>
                </section>
            )}

            <footer className="site-footer">
                Máquina Enigma - Gabriel Novo Vila
            </footer>
        </main>
    );
}
