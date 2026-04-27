const HelpContent = () => {
    return(
        <div className="help-content">
            <h2>¿Cómo jugar?</h2>
            <p>
                YoVi es un juego de estrategia por turnos en un tablero triangular. Tú juegas con las fichas azules 
                y el bot adversario juega con las fichas rojas. El juego alterna turnos entre ambos jugadores hasta 
                que uno de ellos consiga conectar una ruta ganadora.
            </p>

            <h3>Objetivo del Juego</h3>
            <p>
                Ser el primero en conectar tus fichas formando una línea continua ininterrumpida que toque los tres lados 
                del tablero triangular antes de que el bot lo consiga.
            </p>

            <h3>El Tablero</h3>
            <p>
                El tablero es triangular y está dividido en casillas hexagonales. Cada casilla puede contener una ficha 
                (azul, roja o estar vacía). Los tres lados del triángulo actúan como "bordes del tablero" y son necesarios 
                para formar tu ruta ganadora. Tus fichas deben estar adyacentes entre sí para formar una línea conectada.
            </p>

            <h3>Reglas del Juego</h3>
            <ul>
                <li><strong>Turnos:</strong> Los jugadores alternan turnos. Tú siempre empiezas primero (fichas azules).</li>
                <li><strong>Colocación:</strong> En tu turno, haz clic en una casilla vacía del tablero para colocar una de tus fichas.</li>
                <li><strong>Una ficha por turno:</strong> Solo puedes colocar una ficha por turno.</li>
                <li><strong>Casillas ocupadas:</strong> No puedes colocar fichas donde ya hay fichas (azules o rojas).</li>
                <li><strong>Tiempo limitado por turno:</strong> Tienes un tiempo limitado para colocar tu ficha en cada ronda (el temporizador aparece en pantalla). 
                    Si el tiempo se agota, tu turno se pierde automáticamente y es el turno del bot.</li>
                <li><strong>Fichas adyacentes:</strong> Tus fichas deben estar conectadas entre sí (compartir bordes con otras fichas tuyas) 
                    para formar una ruta válida.</li>
            </ul>

            <h3>Cómo Ganar o Perder</h3>
            <p>
                <strong>Ganas</strong> si consigues formar una línea continua de fichas azules que conecte los tres lados del tablero 
                antes de que el bot lo haga con sus fichas rojas.
            </p>
            <p>
                <strong>Pierdes</strong> si el bot completa su línea ganadora primero.
            </p>
        </div>
    )
}

export default HelpContent