
import { PadelCourtRepository } from "../repository/padel-court-repository.js";
import { PadelCourtDTO } from "../dto/internal/PadelCourtDTO.js";

export class PadelCourtService {
    constructor(private padelCourtRepository: PadelCourtRepository) {}

    findAll = async (): Promise<PadelCourtDTO[]> => {
        const padelCourts = await this.padelCourtRepository.findAll();
        return padelCourts.map((padelCourt) => ({
            id: padelCourt.id,
            name: padelCourt.court_name,
        }));
    }
}