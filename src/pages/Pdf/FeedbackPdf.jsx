import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import oswaldFont from "@fontsource/oswald/files/oswald-latin-500-normal.woff";
import { formatDate } from "../../util/helpers";

// Bundled with the app, so exports work without fetching fonts from a CDN.
Font.register({
  family: "Oswald",
  src: oswaldFont,
});

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
    textTransform: "capitalize",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  generated: {
    fontSize: 10,
    textAlign: "center",
    color: "grey",
    marginTop: 4,
    marginBottom: 30,
  },
  item: {
    margin: 12,
  },
  text: {
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  date: {
    fontSize: 10,
    color: "grey",
    marginTop: 4,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

const FeedbackPdf = ({ feedbacks, title, name }) => {
  return (
    <Document title={title} author={name} creator="Suggestify">
      <Page style={styles.body}>
        <Text style={styles.header} fixed>
          Feedbacks Report
        </Text>

        <Text style={styles.title}>{title}</Text>

        {name && <Text style={styles.author}>{name}</Text>}
        <Text style={styles.generated}>
          {feedbacks.length} feedback · generated {formatDate(Date.now())}
        </Text>

        {feedbacks.map(({ feedback, id, dateTime, isMarked }, index) => (
          <View style={styles.item} key={id} wrap={false}>
            <Text style={styles.text}>{index + 1 + ". " + feedback}</Text>
            <Text style={styles.date}>
              {formatDate(dateTime)}
              {isMarked ? " · saved" : ""}
            </Text>
          </View>
        ))}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default FeedbackPdf;
