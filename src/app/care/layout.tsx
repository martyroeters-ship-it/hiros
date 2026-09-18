export default function CareRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("hiros-care-theme");document.documentElement.setAttribute("data-care-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-care-theme","dark");}})();`,
        }}
      />
      {children}
    </>
  );
}
