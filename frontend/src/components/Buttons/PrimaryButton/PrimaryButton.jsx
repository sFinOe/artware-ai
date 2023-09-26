import styles from "./PrimaryButton.module.css";
import PropTypes from "prop-types";

function PrimaryButton({ children, disabled }) {
  return (
    <button
      className={`${styles.primaryButton} ${disabled ? styles.disabled : ""}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
};

PrimaryButton.defaultProps = {
  disabled: false,
};

export default PrimaryButton;
