import db from "../db.server";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const shopRecord = await db.shop.upsert({
    where: { shop },
    update: {},
    create: { shop },
  });

  return {
    shop,
    message: shopRecord.message,
  };
};

export const action = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop;
  const formData = await request.formData();
  const message = formData.get("message");

  await db.shop.update({
    where: { shop },
    data: { message },
  });

  const shopQuery = await admin.graphql(`
    query {
      shop {
        id
      }
    }
  `);

  const shopData = await shopQuery.json();
  const shopId = shopData.data.shop.id;
  // console.log("Attempting to save to Shopify...");

  const response = await admin.graphql(
    `mutation SetMetafield($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "custom",
            key: "message",
            type: "single_line_text_field",
            value: message,
          },
        ],
      },
    },
  );

  const responseJson = await response.json();
  // console.log("SHOPIFY RESPONSE:", JSON.stringify(responseJson, null, 2));
  return { success: true };
};

export default function Index() {
  const { shop, message } = useLoaderData();
  const fetcher = useFetcher();

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>Post Purchase Notify App</h1>
      <p>
        Shop: <strong>{shop}</strong>
      </p>

      <fetcher.Form method="post">
        <label>
          Post-purchase message
          <br />
          <input
            type="text"
            name="message"
            defaultValue={message}
            style={{ width: "100%", marginTop: "8px" }}
          />
        </label>
        <br />
        <br />
        <button type="submit">Save message</button>
      </fetcher.Form>
      {fetcher.data?.success && <p>Message saved</p>}
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
