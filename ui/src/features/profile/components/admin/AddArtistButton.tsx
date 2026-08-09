import { useState } from "react";
import { chakra } from "@chakra-ui/react";
import PlusIcon from "../../../../components/icons/PlusIcon";
import CreateArtistModal from "../../../artists/components/admin/CreateArtistModal";

function AddArtistButton() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <chakra.button
        type="button"
        onClick={() => setModalOpen(true)}
        display="inline-flex"
        alignItems="center"
        gap="6px"
        mt="12px"
        fontSize="13px"
        fontWeight="600"
        color="ink"
        bg="none"
        border="1px solid"
        borderColor="border"
        borderRadius="full"
        px="16px"
        py="8px"
        cursor="pointer"
        transition="background-color 0.15s ease, border-color 0.15s ease"
        _hover={{ bg: "border" }}
      >
        <PlusIcon size={13} />
        Add artist
      </chakra.button>

      {modalOpen && <CreateArtistModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

export default AddArtistButton;
