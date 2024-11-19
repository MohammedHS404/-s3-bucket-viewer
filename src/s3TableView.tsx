import React, { useState } from "react";
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3-client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  CircularProgress,
  Pagination,
} from "@mui/material";
import S3BucketSelector from "./S3BucketSelector";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

interface S3Object {
  Key: string;
  Size: number;
  LastModified: Date;
}

const ITEMS_PER_PAGE = 300;

const S3TableView: React.FC = () => {
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<S3Object[]>([]);
  const [orderBy, setOrderBy] = useState<keyof S3Object>("Key");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [selectedBucket, setSelectedBucket] = useState<string>("");

  const handleBucketSelect = (bucketName: string) => {
    setSelectedBucket(bucketName);
    fetchObjects(bucketName);
  };

  const fetchObjects = async (bucketName: string) => {
    setLoading(true);
    try {
      const command = new ListObjectsV2Command({ Bucket: bucketName });
      const response = await s3Client.send(command);
      if (response.Contents) {
        const transformedData = response.Contents.map((item) => ({
          Key: item.Key!,
          Size: item.Size!,
          LastModified: item.LastModified!,
        }));
        setObjects(transformedData);
        setFilteredObjects(transformedData);
      }
    } catch (error) {
      console.error("Error fetching objects from S3 bucket", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrl = async (bucketName: string, key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    // Generate a signed URL
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  };

  const handleSort = (property: keyof S3Object) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    setPage(1);
    filterObjects(value);
  };

  const filterObjects = (term: string) => {
    if (term === "") {
      setFilteredObjects(objects);
    } else {
      setFilteredObjects(
        objects.filter((obj) =>
          obj.Key.toLowerCase().includes(term.toLowerCase())
        )
      );
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const sortedObjects = filteredObjects.sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === "asc" ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Determine the objects to display based on pagination
  const paginatedObjects = sortedObjects.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div>
      <S3BucketSelector onBucketSelect={handleBucketSelect} />
      {selectedBucket && (
        <div>
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            style={{ marginBottom: "20px" }}
          />
          {loading ? (
            <CircularProgress />
          ) : (
            <div>
              <p>Current Objects: {filteredObjects.length}</p>
              <Pagination
                count={Math.ceil(filteredObjects.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={handlePageChange}
                color="primary"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                }}
              />
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sortDirection={orderBy === "Key" ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === "Key"}
                          direction={orderBy === "Key" ? order : "asc"}
                          onClick={() => handleSort("Key")}
                        >
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={orderBy === "Size" ? order : false}
                      >
                        <TableSortLabel
                          active={orderBy === "Size"}
                          direction={orderBy === "Size" ? order : "asc"}
                          onClick={() => handleSort("Size")}
                        >
                          Size
                        </TableSortLabel>
                      </TableCell>
                      <TableCell
                        sortDirection={
                          orderBy === "LastModified" ? order : false
                        }
                      >
                        <TableSortLabel
                          active={orderBy === "LastModified"}
                          direction={orderBy === "LastModified" ? order : "asc"}
                          onClick={() => handleSort("LastModified")}
                        >
                          Last Modified
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedObjects.map((object) => (
                      <TableRow key={object.Key}>
                        <TableCell>
                          <a
                            href="#"
                            onClick={async (e) => {
                              e.preventDefault();
                              const url = await getUrl(
                                selectedBucket,
                                object.Key
                              );
                              window.open(url, "_blank");
                            }}
                          >
                            {object.Key}
                          </a>
                        </TableCell>
                        <TableCell>{object.Size}</TableCell>
                        <TableCell>
                          {new Date(object.LastModified).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default S3TableView;
