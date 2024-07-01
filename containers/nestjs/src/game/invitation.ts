export default class Invitation {
  inviterIntraId: number;
  inviterName: string;
  gamemode: string;

  constructor(inviterIntraId: number, inviterName: string, gamemode: string) {
    this.inviterIntraId = inviterIntraId;
    this.inviterName = inviterName;
    this.gamemode = gamemode;
  }
}
