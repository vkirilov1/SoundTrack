import { Box, type BoxProps } from "@chakra-ui/react";

function PageContainer(props: BoxProps) {
  return (
    <Box
      as="section"
      w="100%"
      maxW="contentWidth"
      mx="auto"
      px="24px"
      pt="56px"
      pb="80px"
      {...props}
    />
  );
}

export default PageContainer;
