/** */
class menuModel {
    /** */
    constructor() {
      this.Id="",
      this.Name="",
      this.Price=0,      
      this.Description="",
      this.Avatar="",
      this.Content="";
      this.Enabled=false;
      this.Order=0;
      this.Number=0;
      this.Size=[{Name:"small",Price:0}, {Name:"medium",Price:0}, {Name:"big",Price:0}];
      this.CreatedAt=Date.now();
      this.UpdatedAt=Date.now();      
    }
    /**
        * @return {int} The sum of the two numbers.
        * */
    data() {
      return {
        Id: this.Id,
        Name: this.Name,
        Price: this.Price,       
        Description: this.Description,
        Avatar: this.Avatar,
        Enabled: this.Enabled,
        Content: this.Content,
        Order: this.Order,
        Number: this.Number,
        CreatedAt: this.CreatedAt,
        UpdatedAt: this.UpdatedAt,
      };
    }
  }
  module.exports=menuModel;
  