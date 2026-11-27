import { useParams } from "react-router-dom";

export function FicheEtudiantPage() {
    const { id } = useParams()
    return <h1>Fiche de {id}</h1>
}