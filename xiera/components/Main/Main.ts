interface XieraString {
  [index: string]:{
    text: string
  }
}

export default class Main {
  private stringList: XieraString;

  // Implicit casting
  constructor(stringList: object){
    this.stringList = <XieraString>stringList;
  }

  getString(stringCode: string){
    return this.stringList[stringCode];
  }
}