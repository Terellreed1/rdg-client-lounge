import PageLayout from "@/components/PageLayout";

const Merch = () => {
  return (
    <PageLayout>
      <div className="w-full" style={{ height: "calc(100vh - 64px)" }}>
        <iframe
          src="https://luxurycourier.club/"
          title="Luxury Courier Club Merch"
          className="w-full h-full border-0"
          allow="payment"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
        />
      </div>
    </PageLayout>
  );
};

export default Merch;
