import { describe, expect, it } from "vitest";
import { allPlaces, places, routes, experiences } from "./content";

const reviewedCoordinates = {
  "p-triana": { lat: 37.3857, lng: -6.0036 },
  "p-mercado-triana": { lat: 37.3857499, lng: -6.0035503 },
  "p-mercado-feria": { lat: 37.3956895, lng: -5.9913234 },
  "p-bellas-artes": { lat: 37.392416, lng: -6.0000135 },
  "p-puente-isabel": { lat: 37.3862778, lng: -6.0024309 },
  "p-plaza-alfalfa": { lat: 37.3903695, lng: -5.9907591 },
  "p-plaza-pelique": { lat: 37.3911034, lng: -5.988428 },
  "p-calle-feria": { lat: 37.3956895, lng: -5.9913234 },
  "p-mercado-encarnacion": { lat: 37.3930534, lng: -5.9914274 },
  "p-torre-oro": { lat: 37.3824026, lng: -5.9963156 },
  "p-plaza-nueva": { lat: 37.3886108, lng: -5.9951145 },
  "p-setas-parasol": { lat: 37.3931193, lng: -5.9918532 },
  "p-rinconcillo": { lat: 37.3933406, lng: -5.9882942 },
  "p-las-columnas": { lat: 37.3860394, lng: -5.9907674 },
  "p-casa-morales": { lat: 37.3865275, lng: -5.9946141 },
  "p-las-teresas": { lat: 37.3859772, lng: -5.989319 },
  "p-antonio-romero": { lat: 37.3856492, lng: -5.9972722 },
  "p-el-comercio": { lat: 37.3907636, lng: -5.9922804 },
  "p-casa-ruperto": { lat: 37.3818806, lng: -6.0085818 },
  "p-las-golondrinas": { lat: 37.3848669, lng: -6.0055122 },
  "p-blanca-paloma": { lat: 37.3831247, lng: -6.0058348 },
  "p-eslava": { lat: 37.3975489, lng: -5.9969243 },
  "p-casa-vizcaino": { lat: 37.3967572, lng: -5.9912316 },
  "p-dos-de-mayo": { lat: 37.3951436, lng: -5.9970926 },
  "p-puerta-carne": { lat: 37.3857909, lng: -5.9868119 },
  "p-la-campana": { lat: 37.3925807, lng: -5.994848 },
  "p-casa-cuesta": { lat: 37.386027, lng: -6.0044114 },
  "p-casa-1800": { lat: 37.3858539, lng: -5.990801 },
  "p-corral-del-rey": { lat: 37.3894318, lng: -5.9903577 },
  "p-amadeus": { lat: 37.38717, lng: -5.9887104 },
  "p-casas-juderia": { lat: 37.3864934, lng: -5.987454 },
  "p-casa-poeta": { lat: 37.3864325, lng: -5.9891235 },
  "p-dona-maria": { lat: 37.3863587, lng: -5.9916178 },
  "p-mercer": { lat: 37.3875642, lng: -5.9974258 },
  "p-abanico": { lat: 37.3898727, lng: -5.9877525 },
  "p-patio-alameda": { lat: 37.4004414, lng: -5.993316 },
};

describe("place map coordinates", () => {
  it("keeps reviewed landmarks and businesses on their mapped locations", () => {
    for (const [id, coords] of Object.entries(reviewedCoordinates)) {
      expect(allPlaces.find((place) => place.id === id)?.coords, id).toEqual(coords);
    }
  });

  it("does not put map pins on broad areas without a single precise point", () => {
    for (const id of ["p-guadalquivir", "p-naranjos", "p-azulejos-rincones"]) {
      expect(allPlaces.find((place) => place.id === id)?.coords, id).toBeUndefined();
    }
  });

  it("prioritizes neighborhood recommendations over headline sightseeing", () => {
    for (const id of [
      "p-catedral-giralda",
      "p-torre-oro",
      "p-plaza-espana",
      "p-setas-parasol",
      "p-mercado-encarnacion",
      "p-bellas-artes",
      "p-rinconcillo",
      "p-las-columnas",
      "p-casa-morales",
      "p-casa-1800",
    ]) {
      expect(places.some((place) => place.id === id), id).toBe(false);
    }

    expect(places.some((place) => place.id === "p-casa-ruperto")).toBe(true);
    expect(places.some((place) => place.id === "p-patio-alameda")).toBe(true);
    expect(routes.some((route) => route.slug === "sevilla-monumental-en-un-dia")).toBe(false);
    expect(experiences.some((experience) => experience.slug === "atardecer-en-una-azotea")).toBe(false);
    for (const route of routes) {
      expect(route.stops.some((stop) => ["p-catedral-giralda", "p-torre-oro", "p-plaza-espana", "p-setas-parasol", "p-maria-luisa"].includes(stop.placeId))).toBe(false);
    }
  });
});
