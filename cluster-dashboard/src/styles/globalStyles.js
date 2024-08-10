// src/styles/globalStyles.js

export const backgroundColor = '#faf7ed';
export const backgroundColor2 = 'rgba(240, 240, 216, 0.1)';

export const neumorphicStyle = {
    // border: 'none',
    backgroundColor: backgroundColor,
    borderRadius: '19px',
    boxShadow: '1px 1px 2px #e6dfc8, -1px -1px 3px #faf7ed',
    padding: '20px',
    transition: 'all 0.1s ease',
    borderWidth: '5px',
    border: '2px solid rgba(152,54,18,0.09)',

};

export const neumorphicStyleQueryInputs = {
    border: '1px solid rgba(160, 82, 45, 0.1)',
    backgroundColor: backgroundColor,
    borderRadius: '7px',
    boxShadow: '1px 1px 2px #e6dfc8, -1px -1px 2px #e6dfc8',
    padding: '20px',
    transition: 'all 0.2s ease',
    fontFamily: 'Courier New'
};

export const neumorphicButtonStyle = {
    ...neumorphicStyle,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#4a5568',
    marginTop: '10px',
    padding: '25px',
    margin: '0 5px',
    fontFamily: 'Maname, Arial, sans-serif',
    fontSize: '1em'
};

export const headerButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Maname',
    fontWeight: 'bold',
    color: '#4a5568',
    fontSize: '1.17em',
    padding: '0',
    marginBottom: '10px',
    textAlign: 'left',
    transition: 'all 0.1s ease'
};

export const pressedStyle = {
    boxShadow: 'inset 1px 1px 2px #e6dfc8, inset -1px -1px 0px #e6dfc8',
    transform: 'translateY(2px)',
    transition: 'all 0.2s ease'
};

export const neumorphicStyle2 = {
    borderRadius: '15px',
    boxShadow: '5px 5px 10px #d1d1b7, -5px -5px 10px #fffff9',
    padding: '10px',
    transition: 'all 0.3s ease',
    backgroundColor: backgroundColor2
};

export const neumorphicControlsStyle = {
    ...neumorphicStyle2,
    width: '32%',
    opacity: '0.7',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    marginTop: '10px',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '2px solid rgba(160, 82, 45, 0.1)'
};

export const neumorphicControlsStyle3 = {
    backgroundColor: '#faf7ed',
    borderRadius: '15px',
    padding: '10px',
    boxShadow: '4px 3px 5px #d1d1b7, -4px -3px 5px #fffff9',
    border: '4px solid',
    borderColor: 'rgba(152,54,18,0.4)',
    borderWidth: '5px',
};


export const neumorphicControlsStyle2 = {
    ...neumorphicStyle2,
    width: '104px',
    height: '72px',
    opacity: '0.9',
    justifyContent: 'center',
    padding: '15px',
    marginTop: '0px',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: 'none',
    fontSize: '1em',
};

export const viewModeButtonStyle = {
    ...neumorphicButtonStyle,
    width: '81px',
    height: '79px',
    borderRadius: '100%',
    fontSize: '1.1em',
    padding: '0',
};

export const playbackButtonStyle = {
    ...neumorphicButtonStyle,
    fontSize: '1em',
    padding: '25px',
};