
/** */
class userModel {
    /** */
      constructor() {
        this._id="",
        this.name="",
        this.email="",
        this.password="",
        this.phone="",
        this.avatar="",
        this.address="",
        this.isAdmin=false,
        this.log=[];
      }
      /**
    * @return {int} The sum of the two numbers.
    * */
      data() {
        return {_id: this._id,
          name: this.name,
          email: this.email,
          password: this.password,
          phone: this.phone,
          avatar: this.avatar,
          address: this.address,
          isAdmin: this.isAdmin,
        };
      }
    }
    module.exports=userModel;
    