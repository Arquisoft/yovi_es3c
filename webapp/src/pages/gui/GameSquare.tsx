
const selected = false;

export default function GameSquare(size:number){
    
    if(!selected){
        return NormalSquare(size);
    }else{
        return SelectedSquare(size);
    }

}
 

function SelectedSquare(size:number){
    
    const sin60 = 0.8660254;
    const cos60 = 0.5;
    const border = 3;

    return (
        <div
            style={{
                height: size,
                aspectRatio: "0.8660254",
                background: "#ff0000",
                clipPath: `
                polygon(
                    50% 0,
                    -50% 50%,
                    50% 100%,
                    150% 50%,
                    50% 0,
                    50% ${border}px,
                    calc(100% - ${border * sin60}px) calc(25% + ${border * cos60}px),
                    calc(100% - ${border * sin60}px) calc(75% - ${border * cos60}px),
                    50% calc(100% - ${border}px),
                    calc(${border * sin60}px) calc(75% - ${border * cos60}px),
                    calc(${border * sin60}px) calc(25% + ${border * cos60}px),
                    50% ${border}px
                )
                `,
            }}
        />
    );
}

function NormalSquare(size:number){

    return(
       <div className="hexagon" style={{
            height: size,
            aspectRatio: "0.866",
            clipPath: "polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0)",
            background: "white",
            border: "1px solid white"
       }}/>

    );

}



