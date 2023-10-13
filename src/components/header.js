import React, { useState,useEffect } from "react";
import { Box,HStack,Text,Container } from "@chakra-ui/react"

export default function HeaderBar(props) {

    let name = props.name;

    return (
          <HStack
          bg={'black'}
          align={'center'}
          spacing="14px"
          marginTop={'10px'}
          w="100%"
          h="80px"
        >
            <Container>
            <Box>
                <Text>{name}</Text>
            </Box>
            </Container>
        </HStack>
    )

}