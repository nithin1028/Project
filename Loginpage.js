import React, { useEffect, useRef, useState  } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';


const Loginpage = () => {
  const [data, setData] = useState({
    name: "",
    password: "",
    mobilenumber: "",
    email: "",
    username: ""
  });
  const [verify,setverify]=useState(false)
  const verification =localStorage.getItem("issignup")

  const [formdisplay ,setform]=useState(false);
  const update = useRef([]);
  const navigate = useNavigate();

  const [error, setError] = useState({
    passworderror: false,
    emailerror: false,
    numbererror: false,
  });
  
  useEffect(()=>{
    setverify(verification)
  },[verification])


//error 
  const [dataError, setDataError] = useState(false);

  const { name, password, mobilenumber, email, username } = data;

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // ✅ OTP state as array
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));

  const otpchange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // Only allow 1 digit

    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);

    if (value && index < 5) {
      update.current[index + 1].focus();
    }

    if (index === 5) {
      console.log("OTP is:", newOtp.join(""));
    }
  };

  const keydown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otpArray];
      if (!otpArray[index] && index > 0) {
        update.current[index - 1].focus();
        newOtp[index - 1] = "";
      } else {
        newOtp[index] = "";
      }
      setOtpArray(newOtp);
    }
  };
// otp submit handle 
  const otpSubmit = async (e) => {
    e.preventDefault();
     const finalOtp = otpArray.join("");
     const check =await fetch('http://localhost:4000/otpverify',{
    method:'POST',
    headers:{
    'Content-Type':'application/json'
    },
    body:JSON.stringify({otp:finalOtp})
   })
   const result = await check.json();
   console.log(result)
   if(result.otpverification){
  
    navigate('/')
   } 
   else{
     await fetch('http://localhost:4000/removedata',{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      }
      ,body:JSON.stringify({checking:data.email})
      
    })
    alert("OTP Incorrect")
   }   
  };

  // Regex validations
const passwordRegex = /^(?=.*[!@#$%^&*()_+{}:;<>,.?~\\/-]).{8,}$/;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isPasswordValid = passwordRegex.test(password);
    const isEmailValid = emailRegex.test(email);
    const isMobileValid = mobileRegex.test(mobilenumber);

    setError({
      passworderror: !isPasswordValid,
      emailerror: !isEmailValid,
      numbererror: !isMobileValid
    });


    //singup verification
    if (isPasswordValid && isEmailValid && isMobileValid) {
      try {
        const response = await fetch('http://localhost:4000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Backend response:", result);

        if(result.singupverfy){
          localStorage.setItem("issignup",result.singupverfy)
          setform(result.singupverfy)
           try {
      const res = await fetch('http://localhost:4000/otp', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({number:mobilenumber })
      });

      const result = await res.json();
      console.log("OTP Response:", result);
    } catch (error) {
      console.error("OTP Submit Error:", error);
    }
        }

        if (response.ok) {
          alert("Submitted successfully!");
        } else if (response.status === 409) {
          setDataError(true);
        } else {
          alert("Something went wrong. Please try again.");
        }
      } catch (err) {
        console.error("Error sending data:", err);
      }
    } else {
      console.log("Validation error exists");
    }
    setData({
      username: "",
      password: "",
      email: "",
      name: "",
      mobilenumber: ""
    });
  };

if(verify){
  return(
    <Navigate to ='/' replace/>
  )
}


  return (
    <div className='desk'>
      
      {formdisplay &&(
        <div className='otp'>
          <form onSubmit={otpSubmit}>
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                ref={(el) => update.current[index] = el}
                type="text"
                className="ins"
                maxLength="1"
                value={otpArray[index]}
                onChange={(e) => otpchange(e, index)}
                onKeyDown={(e) => keydown(e, index)}
              />
            ))}
            <div>
              <button className='otp-v' type="submit">Verify</button>
            </div>
            
          </form>
          </div>)}

        {/* Signup Form */}


      {!formdisplay&&(  <form onSubmit={handleSubmit}>
          <div className='form'>
            <div className='data'>
              <label>Name</label><br />
              <input className='inp' type="text" name="name" value={name} onChange={handleChange} />
            </div>
            <div className='data'>
              <label>Create Username</label><br />
              <input type="text" className='inp' name="username" value={username} onChange={handleChange} />
            </div>
            <div className='data'>
              <label>Mobile Number</label><br />
              <input className='inp' type="text" name="mobilenumber" value={mobilenumber} onChange={handleChange} />
            </div>
            <div className='data'>
              <label>Email</label><br />
              <input className='inp' type="email" name="email" value={email} onChange={handleChange} />
            </div>
            <div className='data'>
              <label>Password</label><br />
              <input className='inp' type="password" name="password" value={password} onChange={handleChange} />
            </div>
            <div className='data'>
              <button className='buts' type="submit">Submit</button>
            </div>
          </div>

          {/* Validation Errors */}
          {error.emailerror && <p>⚠️ Enter a valid email address.</p>}
          {error.numbererror && <p>⚠️ Enter a valid 10-digit mobile number starting with 6–9.</p>}
          {error.passworderror && <p>⚠️ Password must be at least 8 characters and include a special character.</p>}
          {dataError && <p>⚠️ This user already exists.</p>}
        </form>

      )}
    </div>
  );
};

export default Loginpage;
