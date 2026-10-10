"""Готовит public/geo/moldova-districts.geojson из границ geoBoundaries (ADM1).

Исходник: geoBoundaries-MDA-ADM1_simplified.geojson (gbOpen, CC BY 3.0 IGO).
Запуск: uv run --no-project --with shapely python scripts/build_districts.py <исходник> public/geo/moldova-districts.geojson
"""

import json
import sys
from pathlib import Path

from shapely.geometry import mapping, shape
from shapely.ops import unary_union

NAMES = {
    "Anenii Noi": "Anenii Noi", "Balti": "Bălți", "Basarabeasca": "Basarabeasca",
    "Bender": "Bender", "Briceni": "Briceni", "Cahul": "Cahul", "Calarasi": "Călărași",
    "Cantemir": "Cantemir", "Causeni": "Căușeni", "Chisinau": "Chișinău",
    "Cimislia": "Cimișlia", "Criuleni": "Criuleni", "Donduseni": "Dondușeni",
    "Drochia": "Drochia", "Dubasari": "Dubăsari", "Edinet": "Edineț", "Falesti": "Fălești",
    "Floresti": "Florești", "Gagauzia": "UTA Găgăuzia", "Glodeni": "Glodeni",
    "Hincesti": "Hîncești", "Ialoveni": "Ialoveni", "Leova": "Leova",
    "Nisporeni": "Nisporeni", "Ocnita": "Ocnița", "Orhei": "Orhei", "RIscani": "Rîșcani",
    "Rezina": "Rezina", "SIngerei": "Sîngerei", "Soldanesti": "Șoldănești",
    "Soroca": "Soroca", "Stefan Voda": "Ștefan Vodă", "Straseni": "Strășeni",
    "Taraclia": "Taraclia", "Telenesti": "Telenești", "Transnistria": "UTA Stînga Nistrului",
    "Ungheni": "Ungheni",
}

# 4 знака после запятой — около 10 м: точнее границы районов на карте страны не нужны
PRECISION = 4


def rounded(geometry):
    def walk(value):
        if isinstance(value, (list, tuple)):
            if value and isinstance(value[0], (int, float)):
                return [round(value[0], PRECISION), round(value[1], PRECISION)]
            return [walk(item) for item in value]
        return value

    data = mapping(geometry)
    return {"type": data["type"], "coordinates": walk(data["coordinates"])}


def main(source: Path, target: Path) -> None:
    features = json.loads(source.read_text(encoding="utf-8"))["features"]
    shapes = []
    out = []
    for feature in sorted(features, key=lambda f: NAMES[f["properties"]["shapeName"]]):
        geometry = shape(feature["geometry"]).buffer(0)
        shapes.append(geometry)
        out.append({
            "type": "Feature",
            "properties": {
                "kind": "district",
                "name": NAMES[feature["properties"]["shapeName"]],
                "iso": feature["properties"]["shapeISO"],
            },
            "geometry": rounded(geometry),
        })
    # Точка подписи — внутри самой большой части района: иначе у районов
    # из нескольких частей (Criuleni, Dubăsari, Găgăuzia) подпись повторялась бы
    for feature, geometry in zip(list(out), shapes):
        parts = getattr(geometry, "geoms", [geometry])
        point = max(parts, key=lambda part: part.area).representative_point()
        out.append({
            "type": "Feature",
            "properties": {**feature["properties"], "kind": "label"},
            "geometry": rounded(point),
        })
    # Граница страны — объединение районов: так линии страны и районов совпадают точно
    country = unary_union(shapes).buffer(0)
    out.insert(0, {
        "type": "Feature",
        "properties": {"kind": "country", "name": "Republica Moldova", "iso": "MD"},
        "geometry": rounded(country),
    })
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        json.dumps({"type": "FeatureCollection", "features": out}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(len(out), "объектов,", target.stat().st_size // 1024, "КБ; страна:", country.geom_type)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
