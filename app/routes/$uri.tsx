import { useLoaderData, Link as RmxLink } from "remix";
import { Button, Box, Typography } from "@mui/material";
import type { LoaderFunction, ActionFunction } from "remix";
import { ArrowBackOutlined } from "@mui/icons-material";
import { getNode } from "~/api/getNode";
import type { Node } from "~/types/posts";
import { createComment } from "~/api/createComment";
import Title from "~/components/Content/components/Title";
import Comments from "~/components/Content/components/Comments";
import Author from "~/components/Content/components/Author";
import Taxonomies from "~/components/Content/components/Taxonomies";
import Body from "~/components/Content/components/Body";

export const loader: LoaderFunction = async ({ params }) => {
  return getNode({ uri: params.uri as string });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const values = Object.fromEntries(formData);
  return createComment(values);
};

export default function PostUri() {
  const { title, content, comments, databaseId, categories, tags, author } =
    useLoaderData<Node>();

  return (
    <div>
      <Button
        component={RmxLink}
        disableRipple
        variant="text"
        to={"/"}
        startIcon={<ArrowBackOutlined />}
      >
        Back to blog
      </Button>
      <Title sx={{ mb: 1 }} variant="h2">
        {title}
      </Title>
      <Box sx={{ mb: 5 }}>
        <Taxonomies data={tags?.nodes} />
      </Box>
      <Body>{content}</Body>
      <Box>
        <Taxonomies
          ChipProps={{ variant: "outlined", sx: { borderRadius: 0 } }}
          data={categories?.nodes}
        />
      </Box>
      <Box>
        <Taxonomies data={tags?.nodes} />
      </Box>
      <Author data={author?.node} />
      <Comments databaseId={databaseId} comments={comments} />
    </div>
  );
}
