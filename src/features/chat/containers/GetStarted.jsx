export const GetStarted = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.center}>
        <h2 style={{padding: 13, margin:0, fontWeight: 500, fontSize: 40,}}>Начните диалог</h2>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    fontFamily: "Montserrat",

  },
  center: {
    textAlign: "center",
    backgroundColor: "#2D2D2D",
    borderRadius: 19,
  },
};