import { useState } from "react";
import { useForm } from "../hooks";
import { validators } from "../utils";

const LoginForm = ({ onLogin, error }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    values,
    errors,
    setValue,
    setFieldTouched,
    validate,
    isValid
  } = useForm(
    { username: '' },
    { username: validators.username }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(values.username.trim());
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setValue('username', e.target.value);
  };

  const handleUsernameBlur = () => {
    setFieldTouched('username');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Join WhatsApp Clone</h2>
        <p>Enter your username to start chatting</p>
        
        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="text"
              placeholder="Enter your username"
              value={values.username}
              onChange={handleUsernameChange}
              onBlur={handleUsernameBlur}
              className={errors.username ? 'error' : ''}
              autoFocus
              disabled={isLoading}
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={!isValid || isLoading || !values.username.trim()}
            className="login-button"
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Joining...
              </>
            ) : (
              'Join Chat'
            )}
          </button>
        </form>
        
        <div className="login-tips">
          <h4>Username Requirements:</h4>
          <ul>
            <li>2-20 characters long</li>
            <li>Letters, numbers, and underscores only</li>
            <li>Must be unique</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
