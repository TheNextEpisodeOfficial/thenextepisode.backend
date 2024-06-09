export function getBttlOptTit({ bttlGnrCd, bttlRule, bttlMbrCnt }) {
  return `${getFullGnrNmByCd(bttlGnrCd)} ${bttlMbrCnt}vs${bttlMbrCnt}${
    bttlRule ? " - " + bttlRule : ""
  }`;
}

export function getFullGnrNmByCd(bttlGnrCd) {
  switch (bttlGnrCd) {
    case "ALL":
      return "ALL Ganre";
    case "BRK":
      return "Breaking";
    case "PP":
      return "Popping";
    case "LCK":
      return "Locking";
    case "WCK":
      return "Waacking";
    case "HH":
      return "HipHop";
    case "KRMP":
      return "Krump";
    case "HS":
      return "House";
    case "VG":
      return "Voguing";
    case "DCHL":
      return "Dance Hall";
    case "ETC":
      return "ETC";
    default:
      return bttlGnrCd;
  }
}
