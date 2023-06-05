import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import MathJax from "react-mathjax2";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw"; 

interface ImageData {
  path: string;
  url: string;
}

const tasksTable = ({ archiveName, markdownFilePath }: { archiveName: string, markdownFilePath: string }) => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [imageUrls, setImageUrls] = useState<ImageData[]>([]);

  useEffect(() => {
    const fetchMarkdownContent = async () => {
      try {
        const response = await fetch(
          `/api/fetchTasks?archiveName=${archiveName}&markdownFilePath=${markdownFilePath}`
        );
        const data = await response.json();
        setMarkdownContent(data.markdownContent);
        setImageUrls(data.imageUrls);
      } catch (error) {
        console.error("Error fetching markdown content:", error);
      }
    };

    fetchMarkdownContent();
  }, [archiveName, markdownFilePath]);

  const components = {
    img: ({ src, alt }: { src?: string; alt: string }) => {
      if (src) {
        const imageData = imageUrls.find((image) => image.path === src);
        if (imageData) {
          return <img src={imageData.url} alt={alt as string} />;
        }
      }
      return <img src={src} alt={alt as string} />;
    },
    table: ({ children }: { children: React.ReactNode }) => (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{ borderCollapse: "collapse", border: "1px solid black" }}
        >
          {children}
        </table>
      </div>
    ),
    tableHead: ({ children }: { children: React.ReactNode }) => (
      <thead>
        <tr>{children}</tr>
      </thead>
    ),
    tableBody: ({ children }: { children: React.ReactNode }) => (
      <tbody>{children}</tbody>
    ),
    tableRow: ({ children }: { children: React.ReactNode }) => (
      <tr style={{ borderBottom: "1px solid black" }}>{children}</tr>
    ),
    tableCell: ({ children }: { children: React.ReactNode }) => (
      <td style={{ border: "1px solid black", padding: "8px" }}>{children}</td>
    ),
  };

  return (
    <div
      style={{
        margin: "0 auto",
        maxWidth: "800px",
        padding: "40px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          margin: "20px 0",
          height: "1px",
          backgroundColor: "#000",
        }}
      ></div>
      <MathJax.Context>
        <ReactMarkdown
        // @ts-ignore
          components={components}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {markdownContent}
        </ReactMarkdown>
      </MathJax.Context>
    </div>
  );
};

export default tasksTable;
