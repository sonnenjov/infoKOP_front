export default function AdminGeneral() {
  return (
    <div className="main_general">
      <p>Platform branding</p>
      
      
      <div className="logochange">
          <div className="logopart">
              <div className="logoouter">
                <div className="logoouterlayout"/>
                <div className="logoouter_content">
                  <span className="material-symbols-outlined">
                      image
                  </span>
                </div>
              </div>
          </div>

          <div className="textpartmid">
            <p>Brand Logo</p>
            <p>SVG or PNG. Max 2MB.</p>
          </div>

          <div className="button">
            <button>Replace</button>
          </div>
      </div>

      
      <div className="lang_currency">
          <label htmlFor="lang">
            Default Language
            <input type="text" id="lang" />
          </label>

          <label htmlFor="currency">
            Default Currency
            <input type="text" id="currency" />
          </label>
      </div>


      <div className="op_hours">
        <p>Resort Operational hours</p>
        
        
        <div className="workdays">
            <p>Monday-Friday</p>
            <div className="inputs">
              <input type="time" name="" id="" />
              to
              <input type="time" name="" id="" />
            </div>
        </div>
        
        
        
        <div className="weekdays">
            <p>Weekend & Holidays</p>
            <div className="inputs">
              <input type="time" name="" id="" />
              to
              <input type="time" name="" id="" />
            </div>
        </div>
      </div>

    </div>
  )
}