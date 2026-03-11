export default function GameSquare(size:number){
    
   return NormalSquare(size);

}

function NormalSquare(size:number){

    return(
       <div className="hexagon" style={{
            height: size,
            aspectRatio: "0.866",
            clipPath: "polygon(-50% 50%, 50% 100%, 150% 50%, 50% 0)",
            background: "grey",
            border: "1px solid grey"
       }}/>

    );

}



