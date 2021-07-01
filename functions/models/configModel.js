/** */
class configModel {
    /** */
      constructor() {
        this.Company_Name="",
        this.Company_Phone="",
        this.Company_Email="",
        this.Company_Address="",
        this.Company_Lat="",
        this.Company_Long="",
        this.Googlemap_Key="",
        this.Company_Logo="",
        this.Company_Slogen="",
        this.Company_Avatar="",
        this.Company_Description="",
        this.Company_Mission="",
        this.Company_Vision="",
        this.Company_About="";
      }
      /**
       * @return {int} The sum of the two numbers.
       * */
      data() {
        return {
          Company_Name: this.Company_Name,
          Company_Phone: this.Company_Phone,
          Company_Email: this.Company_Email,
          Company_Address: this.Company_Address,
          Company_Lat: this.Company_Lat,
          Company_Long: this.Company_Long,
          Googlemap_Key: this.Googlemap_Key,
          Company_Logo: this.Company_Logo,
          Company_Slogen: this.Company_Slogen,
          Company_Avatar: this.Company_Avatar,
          Company_Description: this.Company_Description,
          Company_Mission: this.Company_Mission,
          Company_Vision: this.Company_Vision,
          Company_About: this.Company_About,
        };
      }
    }
    module.exports=configModel;
    