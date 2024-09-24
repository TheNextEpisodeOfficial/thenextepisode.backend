export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}

export class getCardCompanyNameTransformer {
  to(data: string): string {
    return data;
  }
  from(data: string): string {
    return getCardCompanyName(data, "KR");
  }
}

function getCardCompanyName(cardCodeInput, lang: "KR" | "EN") {
  switch (lang) {
    case "KR":
      switch (cardCodeInput) {
        case "3K":
          return "기업비씨";
        case "46":
          return "광주";
        case "71":
          return "롯데";
        case "30":
          return "산업";
        case "31":
          return "-";
        case "51":
          return "삼성";
        case "38":
          return "새마을";
        case "41":
          return "신한";
        case "62":
          return "신협";
        case "36":
          return "씨티";
        case "33":
          return "우리";
        case "W1":
          return "우리";
        case "37":
          return "우체국";
        case "39":
          return "저축";
        case "35":
          return "전북";
        case "42":
          return "제주";
        case "15":
          return "카카오뱅크";
        case "3A":
          return "케이뱅크";
        case "24":
          return "토스뱅크";
        case "21":
          return "하나";
        case "61":
          return "현대";
        case "11":
          return "국민";
        case "91":
          return "농협";
        case "34":
          return "수협";
        case "6D":
          return "다이너스";
        case "4M":
          return "마스터";
        case "3C":
          return "유니온페이";
        case "7A":
          return "아메리칸 익스프레스";
        case "4J":
          return "JCB";
        case "4V":
          return "비자";
        default:
          return "해당 코드에 대한 카드사 정보가 없습니다";
      }

    case "EN":
      switch (cardCodeInput) {
        case "3K":
          return "IBK_BC";
        case "46":
          return "GWANGJUBANK";
        case "71":
          return "LOTTE";
        case "30":
          return "KDBBANK";
        case "31":
          return "BC";
        case "51":
          return "SAMSUNG";
        case "38":
          return "SAEMAUL";
        case "41":
          return "SHINHAN";
        case "62":
          return "SHINHYEOP";
        case "36":
          return "CITI";
        case "33":
          return "WOORI";
        case "W1":
          return "WOORI";
        case "37":
          return "POST";
        case "39":
          return "SAVINGBANK";
        case "35":
          return "JEONBUKBANK";
        case "42":
          return "JEJUBANK";
        case "15":
          return "KAKAOBANK";
        case "3A":
          return "KBANK";
        case "24":
          return "TOSSBANK";
        case "21":
          return "HANA";
        case "61":
          return "HYUNDAI";
        case "11":
          return "KOOKMIN";
        case "91":
          return "NONGHYEOP";
        case "34":
          return "SUHYEOP";
        case "6D":
          return "DINERS";
        case "4M":
          return "MASTER";
        case "3C":
          return "UNIONPAY";
        case "7A":
          return "AMEX";
        case "4J":
          return "JCB";
        case "4V":
          return "VISA";
        default:
          return "No information available for the provided code";
      }

    default:
      return 'Invalid language code. Please use "kr" or "en".';
  }
}
