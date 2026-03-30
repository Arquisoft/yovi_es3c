const HelpContent = () => {
    return(
        <div className="help-content">
            <h2>¿Cómo jugar?</h2>
            <p>
                YoVi es un juego de estrategia por turnso en un tablero triangular.
                Tú juegas con las fichas azules y el bot con las fichas rojas.
            </p>

            <h3>Objetivo</h3>
            <p>
                Conectar tus fichas formando una línea continua que conecte los tres lados del tablero antes de que lo haga el bot.
            </p>

            <h3>Reglas</h3>
            <p>
                <ul>
                    <li>Los jugadores se turnan colocando una ficha por turno.</li>
                    <li>Sólo puedes colocar fichas en casillas vacías.</li>
                    <li>El primero en conectar sus dos lados gana la partida.</li>
                </ul>
            </p>
        </div>
    )
}

export default HelpContent