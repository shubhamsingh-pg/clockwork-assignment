import {
  extend,
  render,
  BlockStack,
  Text,
  CalloutBanner,
} from "@shopify/post-purchase-ui-extensions-react";

extend(
  "Checkout::PostPurchase::ShouldRender",

  async ({ storage, inputData }) => {
    // console.log("EXTENSION INPUT:", JSON.stringify(inputData));
    let message = "Thank you for your order!";
    const metafields = inputData?.shop?.metafields || [];

    if (Array.isArray(metafields) && metafields.length > 0) {
      const found = metafields.find((m) => m.key === "message");
      if (found?.value) {
        message = found.value;
      }
    } else if (metafields?.custom?.message?.value) {
      message = metafields.custom.message.value;
    }
    await storage.update({ message });
    return { render: true };
  },
);

render("Checkout::PostPurchase::Render", ({ storage }) => {
  return (
    <BlockStack spacing="loose">
      {" "}
      <CalloutBanner title="Special Offer">
        <Text>{storage.initialData.message}</Text>
      </CalloutBanner>
    </BlockStack>
  );
});
