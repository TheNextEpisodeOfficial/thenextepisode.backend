export class TicketListDto {
  tcktId: string;
  teamAsgnYn: string;
  hndOvrYn: string;
  usedYn: string;
  ordItemId: string;
  bttlOptId: string | null;
  adncOptId: string | null;

  optTit: string | null;
  bttlrId: string | null;
  bttlTeamNm: string | null;

  bttlrNm: string | null;
  bttlrDncrNm: string | null;
  bttlrBirth: string | null;
  bttlrPhn: string | null;
  adncNm: string | null;
  plnNm: string | null;
  plnRoadAddr: string | null;
  plnAddrDtl: string | null;
  plnDt: string | null;
  tcktThumb: string | null;
}
