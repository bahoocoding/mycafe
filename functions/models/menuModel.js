/** */
class menuModel {
  /** */
    constructor() {
      this.Id="",
      this.Name="",     
      this.Price=0,
      this.Order=0,
      this.Number_Order=0,
      this.Description="",
      this.Avatar="",
      this.Content="";     
      this.Enabled=false;
    }
    /**
  * @return {int} The sum of the two numbers.
  * */
    data() {
      return {
        Id: this.Id,
        Name: this.Name,       
        Price: this.Price,
        Order: this.Order,
        Number_Order: this.Number_Order,
        Description: this.Description,
        Avatar: this.Avatar,
        Enabled: this.Enabled,
        Content: this.Content,       
      };
    }
  }
  module.exports=menuModel;
  