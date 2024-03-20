import { getKeyByValue } from "../../utils/RedStoneRandom";

const Mapset = {
    Grassland: 0,
    Mountains: 1,
    Desert: 2,
    Savana: 3,
    Cave: 4,
    Dungeon: 5,
    Tower: 6,
    Mine: 7,
    Hell: 8,
    Heaven: 9,
    Brunenstig: 10,
    Bigaple: 11,
    Augusta: 12,
    Bridgehead: 13,
    Mountains_Village: 14,
    Arian: 15,
    Ruined_City: 16,
    FarmHouse: 17,
    Gypsy: 18,
    Room: 19,
}

export default Mapset;

export const getMapsetName = (mapsetId) => {
    return getKeyByValue(Mapset, mapsetId);
}